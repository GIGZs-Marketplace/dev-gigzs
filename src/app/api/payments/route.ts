import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cashfreeService } from '../../../services/cashfree';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Add this type for better type safety
interface PaymentRequest {
  contractId: string;
  amount: number;
  paymentType: 'milestone' | 'completion';
}

export async function POST(request: Request) {
  console.log('Payment request received');
  
  try {
    // Parse the request body
    let requestBody: PaymentRequest;
    
    try {
      const text = await request.text();
      console.log('Request body text:', text);
      
      if (!text) {
        console.log('Empty request body');
        return NextResponse.json(
          { error: 'Request body is required' },
          { status: 400 }
        );
      }
      
      requestBody = JSON.parse(text);
      console.log('Parsed request body:', requestBody);
      
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { contractId, amount, paymentType } = requestBody;

    // Validate required fields
    if (!contractId || amount === undefined || !paymentType) {
      return NextResponse.json(
        { error: 'Missing required fields: contractId, amount, or paymentType' },
        { status: 400 }
      );
    }

    // Get contract details with client information
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*, client:client_id(*)')
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([
        {
          contract_id: contractId,
          amount,
          payment_type: paymentType,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (paymentError || !payment) {
      console.error('Error creating payment:', paymentError);
      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: 500 }
      );
    }

    // Create Cashfree payment link
    const paymentLink = await cashfreeService.createPaymentLink({
      orderId: payment.id,
      amount,
      customerName: contract.client?.email?.split('@')[0] || 'Customer',
      customerEmail: contract.client?.email || '',
      customerPhone: contract.client?.phone || '',
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payments/success`,
    });

    // Update payment with Cashfree link ID
    await supabase
      .from('payments')
      .update({ cashfree_payment_link_id: paymentLink.order_id })
      .eq('id', payment.id);

    return NextResponse.json({ paymentLink });
  } catch (error) {
    console.error('Error in payment creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
