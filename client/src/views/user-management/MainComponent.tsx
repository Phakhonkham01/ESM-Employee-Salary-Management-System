import React, { useState } from 'react'
import UserList from './UserList'
import UserFormModal from './UserFormModal'
import type { UserData } from '../../services/Create_user/api'
import { HiUserAdd } from 'react-icons/hi'

const MainComponent: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<UserData | null>(null)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const handleCreateUser = () => {
        setEditingUser(null)
        setIsModalOpen(true)
    }

    const handleEditUser = (user: UserData) => {
        setEditingUser(user)
        setIsModalOpen(true)
    }

    const handleModalClose = () => {
        setIsModalOpen(false)
        setEditingUser(null)
    }

    const handleSuccess = () => {
        setRefreshTrigger((prev) => prev + 1)
    }

    return (
        <div
            style={{
                padding: '30px',
                maxWidth: '1400px',
                margin: '0 auto',
                backgroundColor: '#f9fafb',
                minHeight: '100vh',
            }}
        >
            {/* Header */}
            <div
                style={{
                    marginBottom: '5px',
                    padding: '5px',

                    borderRadius: '12px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '5px',
                    }}
                >
                    <h1
                        style={{
                            margin: 0,
                            fontSize: '10px',
                            fontWeight: '400',
                            color: '#1f2937',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                        }}
                    ></h1>
                    <button
                        onClick={handleCreateUser}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = '#2563eb')
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = '#3b82f6')
                        }
                    >
                        <HiUserAdd size={18} />
                        Create New User
                    </button>
                </div>
            </div>

            {/* User List */}
            <UserList onEdit={handleEditUser} key={refreshTrigger} />

            {/* User Form Modal */}
            <UserFormModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                editingUser={editingUser}
                onSuccess={handleSuccess}
            />

            {/* Footer */}
            {/* <div
                style={{
                    marginTop: '30px',
                    padding: '20px',
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: '13px',
                    borderTop: '1px solid #e5e7eb',
                }}
            >
                <p style={{ margin: 0 }}>
                    User Management System v1.0 • Created with React &
                    TypeScript
                </p>
            </div> */}
        </div>
    )
}

export default MainComponent
