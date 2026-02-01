export const THEME = {
    colors: {
        primary: {
            blue: 'blue',
            indigo: 'indigo',
            sky: 'sky',
        },
        status: {
            success: 'emerald', // Only for validated/verified
            warning: 'amber',   // Only for pending/premium
            error: 'red',       // For errors/rejections
            neutral: 'slate'    // For defaults
        }
    },
    // Standardized gradients matching "Logo Blue" logic
    gradients: {
        primary: 'bg-gradient-to-r from-blue-600 to-indigo-600',
        card: 'bg-gradient-to-br from-blue-500 to-indigo-600',
        header: 'bg-gradient-to-r from-blue-600 to-indigo-700'
    },
    // Component specific variants
    badges: {
        pending: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
        accepted: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
        rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
        verified: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' }
    }
};

export const getStatusBadgeStyle = (status) => {
    switch (status) {
        case 'ACCEPTED':
        case 'VALIDATED':
            return THEME.badges.accepted;
        case 'PENDING':
            return THEME.badges.pending;
        case 'REJECTED':
        case 'REFUSED':
            return THEME.badges.rejected;
        case 'VERIFIED':
            return THEME.badges.verified;
        default:
            return THEME.badges.pending;
    }
};
