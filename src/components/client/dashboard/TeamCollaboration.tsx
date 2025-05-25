// /*import React, { useState } from 'react'
// import { 
//   Users, 
//   UserPlus, 
//   Mail, 
//   Phone, 
//   MapPin, 
//   Link2, 
//   MoreVertical, 
//   Star,
//   Shield,
//   Settings,
//   Clock,
//   Calendar,
//   Search,
//   Filter,
//   ChevronDown,
//   Edit,
//   Trash2,
//   CheckCircle,
//   X,
//   AlertTriangle
// } from 'lucide-react'
// import { supabase } from '../../../lib/supabase'

// interface TeamMember {
//   id: string
//   name: string
//   role: string
//   email: string
//   phone: string
//   location: string
//   avatar: string
//   status: string
//   projects: number
//   permissions: string[]
//   lastActive: string
// }

// function TeamCollaboration() {
//   const [showAddMember, setShowAddMember] = useState(false)
//   const [showPermissions, setShowPermissions] = useState(false)
//   const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [filterRole, setFilterRole] = useState('all')
//   const [filterStatus, setFilterStatus] = useState('all')

//   const handleAddMember = async (formData: any) => {
//     try {
//       const { data, error } = await supabase
//         .from('team_members')
//         .insert([{
//           ...formData,
//           client_id: 'current_client_id', // Replace with actual client ID
//           created_at: new Date().toISOString()
//         }])

//       if (error) throw error

//       setShowAddMember(false)
//       // Refresh team members list
//     } catch (error) {
//       console.error('Error adding team member:', error)
//     }
//   }

//   const handleUpdatePermissions = async (memberId: string, permissions: string[]) => {
//     try {
//       const { error } = await supabase
//         .from('team_members')
//         .update({ permissions })
//         .eq('id', memberId)

//       if (error) throw error

//       setShowPermissions(false)
//       // Refresh team members list
//     } catch (error) {
//       console.error('Error updating permissions:', error)
//     }
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-xl font-semibold text-gray-800">Team Collaboration</h2>
//           <p className="text-sm text-gray-600 mt-1">Manage your team members and their access permissions</p>
//         </div>
//         <button
//           onClick={() => setShowAddMember(true)}
//           className="flex items-center px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] transition-colors"
//         >
//           <UserPlus size={20} className="mr-2" />
//           Add Team Member
//         </button>
//       </div>

//       {/* Search and Filters */}
//       <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
//         <div className="flex items-center space-x-4">
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Search team members..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:border-[#00704A]"
//             />
//             <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
//           </div>
          
//           <select
//             value={filterRole}
//             onChange={(e) => setFilterRole(e.target.value)}
//             className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
//           >
//             <option value="all">All Roles</option>
//             <option value="admin">Admin</option>
//             <option value="manager">Project Manager</option>
//             <option value="member">Team Member</option>
//           </select>

//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//             className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
//           >
//             <option value="all">All Status</option>
//             <option value="active">Active</option>
//             <option value="inactive">Inactive</option>
//           </select>
//         </div>

//         <div className="flex items-center space-x-3">
//           <span className="text-sm text-gray-600">Sort by:</span>
//           <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
//             <span className="text-gray-700">Most Recent</span>
//             <ChevronDown size={16} className="ml-2" />
//           </button>
//         </div>
//       </div>

//       {/* Team Members Grid */}
//       {/* Simulate no team members for now; show placeholder UI */}
//       {true && (
//         <div className="flex flex-col items-center justify-center h-64">
//           <p className="text-gray-500 mb-4">No team members yet.</p>
//           <button
//             className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all"
//             onClick={() => setShowAddMember(true)}
//           >
//             Add Team Member
//           </button>
//         </div>
//       )}
//             </div>

//             <div className="mt-4 pt-4 border-t border-gray-100">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-4">
//                   <div className="flex items-center text-sm text-gray-600">
//                     <Clock size={16} className="mr-1" />
//                     <span>Last active: {member.lastActive}</span>
//                   </div>
//                   <div className="flex items-center text-sm text-gray-600">
//                     <Shield size={16} className="mr-1" />
//                     <span>Role: {member.role}</span>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <button className="text-[#00704A] hover:text-[#005538] text-sm font-medium">
//                     View Profile
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Add Member Modal */}
//       {showAddMember && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-semibold">Add Team Member</h3>
//               <button
//                 onClick={() => setShowAddMember(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X size={24} />
//               </button>
//             </div>

//             <form className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Full Name</label>
//                   <input
//                     type="text"
//                     className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Email</label>
//                   <input
//                     type="email"
//                     className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Role</label>
//                   <select className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none">
//                     <option>Project Manager</option>
//                     <option>Team Member</option>
//                     <option>Admin</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Phone</label>
//                   <input
//                     type="tel"
//                     className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#00704A] focus:outline-none"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Permissions</label>
//                 <div className="mt-2 space-y-2">
//                   {[
//                     'View projects',
//                     'Edit projects',
//                     'Manage team members',
//                     'View contracts',
//                     'Sign contracts',
//                     'Access financial data'
//                   ].map((permission) => (
//                     <label key={permission} className="flex items-center">
//                       <input
//                         type="checkbox"
//                         className="rounded border-gray-300 text-[#00704A] focus:ring-[#00704A]"
//                       />
//                       <span className="ml-2 text-sm text-gray-700">{permission}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <div className="flex justify-end space-x-2 mt-6">
//                 <button
//                   type="button"
//                   onClick={() => setShowAddMember(false)}
//                   className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]"
//                 >
//                   Add Member
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Permissions Modal */}
//       {showPermissions && selectedMember && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-semibold">Manage Permissions</h3>
//               <button
//                 onClick={() => setShowPermissions(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X size={24} />
//               </button>
//             </div>

//             <div className="mb-4">
//               <div className="flex items-center space-x-3">
//                 <img
//                   src={selectedMember.avatar}
//                   alt={selectedMember.name}
//                   className="w-10 h-10 rounded-full"
//                 />
//                 <div>
//                   <h4 className="font-medium">{selectedMember.name}</h4>
//                   <p className="text-sm text-gray-600">{selectedMember.role}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <h4 className="font-medium mb-2">Project Permissions</h4>
//                 <div className="space-y-2">
//                   {[
//                     'View projects',
//                     'Create projects',
//                     'Edit projects',
//                     'Delete projects',
//                     'Manage project settings'
//                   ].map((permission) => (
//                     <label key={permission} className="flex items-center">
//                       <input
//                         type="checkbox"
//                         className="rounded border-gray-300 text-[#00704A] focus:ring-[#00704A]"
//                       />
//                       <span className="ml-2 text-sm text-gray-700">{permission}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <h4 className="font-medium mb-2">Team Permissions</h4>
//                 <div className="space-y-2">
//                   {[
//                     'View team members',
//                     'Add team members',
//                     'Remove team members',
//                     'Manage roles'
//                   ].map((permission) => (
//                     <label key={permission} className="flex items-center">
//                       <input
//                         type="checkbox"
//                         className="rounded border-gray-300 text-[#00704A] focus:ring-[#00704A]"
//                       />
//                       <span className="ml-2 text-sm text-gray-700">{permission}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <h4 className="font-medium mb-2">Contract Permissions</h4>
//                 <div className="space-y-2">
//                   {[
//                     'View contracts',
//                     'Create contracts',
//                     'Sign contracts',
//                     'Manage contract settings'
//                   ].map((permission) => (
//                     <label key={permission} className="flex items-center">
//                       <input
//                         type="checkbox"
//                         className="rounded border-gray-300 text-[#00704A] focus:ring-[#00704A]"
//                       />
//                       <span className="ml-2 text-sm text-gray-700">{permission}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-end space-x-2 mt-6">
//               <button
//                 onClick={() => setShowPermissions(false)}
//                 className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => {
//                   // Handle permissions update
//                   setShowPermissions(false)
//                 }}
//                 className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]"
//               >
//                 Save Changes
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
// *

// // No hardcoded team members. Fetch from backend or show placeholder if none.

// // Example placeholder UI for empty team:
// // Inside your TeamCollaboration component's render:
// // if (!teamMembers || teamMembers.length === 0) {
// //   return (
// //     <div className="flex flex-col items-center justify-center h-64">
// //       <p className="text-gray-500 mb-4">No team members yet.</p>
// //       <button
// //         className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all"
// //         onClick={() => setShowAddMember(true)}
// //       >
// //         Add Team Member
// //       </button>
// //     </div>
// //   );
// // }

// export default TeamCollaboration