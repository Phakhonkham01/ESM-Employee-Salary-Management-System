import React from 'react'

/* ================= TYPES ================= */
export type RequestStatus = 'Pending' | 'Accepted' | 'Rejected'

/* ================= STYLES ================= */
export const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
}

export const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '32px',
}

export const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
}

export const th: React.CSSProperties = {
    padding: '12px 16px',
    textAlign: 'left',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    fontWeight: '600',
    fontSize: '14px',
    borderBottom: '2px solid #e5e7eb',
}

export const td: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px',
    color: '#4b5563',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
}

export const tr: React.CSSProperties = {
    transition: 'background-color 0.2s',
}

/* ================= HELPER FUNCTIONS ================= */
export const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    } catch (error) {
        console.error('Invalid date format:', dateString)
        return 'Invalid Date'
    }
}

/* ================= COMPONENTS ================= */
export const badgeStyle = (color: string): React.CSSProperties => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: color + '20', // Add opacity (20% opacity)
    color: color,
    border: `1px solid ${color}40`,
})

export const statusBadge = (status: RequestStatus): React.ReactElement => {
    switch (status) {
        case 'Pending':
            return <span style={badgeStyle('#f59e0b')}>⏳ Pending</span>
        case 'Accepted':
            return <span style={badgeStyle('#10b981')}>✅ Accepted</span>
        case 'Rejected':
            return <span style={badgeStyle('#ef4444')}>❌ Rejected</span>
        default:
            return <span style={badgeStyle('#6b7280')}>Unknown</span>
    }
}

export const EmptyRow = ({
    colSpan,
}: {
    colSpan: number
}): React.ReactElement => (
    <tr>
        <td
            colSpan={colSpan}
            style={{
                textAlign: 'center',
                padding: '40px',
                color: '#9ca3af',
                fontSize: '16px',
            }}
        >
            No data available
        </td>
    </tr>
)

export const Section = ({
    title,
    children,
}: {
    title: string
    children: React.ReactNode
}): React.ReactElement => (
    <div
        style={{
            marginBottom: '32px',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}
    >
        <h3
            style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: '2px solid #e5e7eb',
            }}
        >
            {title}
        </h3>
        {children}
    </div>
)

/* ================= ADDITIONAL UTILITIES ================= */
export const formatDateTime = (dateString: string): string => {
    try {
        const date = new Date(dateString)
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch (error) {
        return 'Invalid Date'
    }
}

export const getStatusColor = (status: RequestStatus): string => {
    switch (status) {
        case 'Pending':
            return '#f59e0b'
        case 'Accepted':
            return '#10b981'
        case 'Rejected':
            return '#ef4444'
        default:
            return '#6b7280'
    }
}

export const LoadingSpinner = (): React.ReactElement => (
    <div
        style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
        }}
    >
        <div
            style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
            }}
        />
        <style>{`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `}</style>
    </div>
)

export const ErrorMessage = ({
    message,
}: {
    message: string
}): React.ReactElement => (
    <div
        style={{
            padding: '16px',
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '6px',
            color: '#dc2626',
            marginBottom: '16px',
        }}
    >
        ⚠️ {message}
    </div>
)

export const SuccessMessage = ({
    message,
}: {
    message: string
}): React.ReactElement => (
    <div
        style={{
            padding: '16px',
            backgroundColor: '#d1fae5',
            border: '1px solid #10b981',
            borderRadius: '6px',
            color: '#065f46',
            marginBottom: '16px',
        }}
    >
        ✅ {message}
    </div>
)

/* ================= TABLE COMPONENTS ================= */
export const TableHeader = ({
    columns,
}: {
    columns: string[]
}): React.ReactElement => (
    <thead>
        <tr>
            {columns.map((col, index) => (
                <th key={index} style={th}>
                    {col}
                </th>
            ))}
        </tr>
    </thead>
)

export const TableRow = ({
    children,
}: {
    children: React.ReactNode
}): React.ReactElement => <tr style={tr}>{children}</tr>

export const TableCell = ({
    children,
    style = {},
}: {
    children: React.ReactNode
    style?: React.CSSProperties
}): React.ReactElement => <td style={{ ...td, ...style }}>{children}</td>
