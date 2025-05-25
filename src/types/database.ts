export interface Project {
    id: string;
    title: string;
    client_id: string;
    freelancer_id: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    total_amount: number;
    created_at: string;
    updated_at: string;
    client?: ClientProfile;
    freelancer?: FreelancerProfile;
}

export interface ClientProfile {
    id: string;
    user_id: string;
    company_name: string;
    email: string;
    phone: string;
    created_at: string;
    updated_at: string;
}

export interface FreelancerProfile {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    phone: string;
    created_at: string;
    updated_at: string;
}

export interface Payment {
    id: string;
    project_id: string;
    amount: number;
    status: 'pending' | 'paid' | 'failed';
    payment_type: 'milestone' | 'completion';
    cashfree_payment_link_id?: string;
    cashfree_payment_id?: string;
    created_at: string;
    updated_at: string;
    project?: Project;
}

export interface FreelancerWallet {
    id: string;
    freelancer_id: string;
    available_balance: number;
    total_earned: number;
    created_at: string;
    updated_at: string;
}

export interface PayoutRequest {
    id: string;
    freelancer_id: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    bank_account_number: string;
    bank_ifsc_code: string;
    created_at: string;
    updated_at: string;
}

export interface Profile {
    id: string;
    email: string;
    role: 'client' | 'freelancer';
    full_name?: string;
    company_name?: string;
    created_at: string;
    updated_at: string;
} 