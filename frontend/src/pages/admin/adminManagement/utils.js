// Utilitaires pour AdminManagement

export const getRoleColor = (role) => {
  const colors = {
    'super-admin': 'bg-red-100 text-red-800',
    'admin': 'bg-blue-100 text-blue-800',
    'moderator': 'bg-green-100 text-green-800',
    'support': 'bg-yellow-100 text-yellow-800'
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};

export const getRoleLabel = (role) => {
  const labels = {
    'super-admin': 'Super Admin',
    'admin': 'Admin',
    'moderator': 'Modérateur',
    'support': 'Support'
  };
  return labels[role] || role;
};

export const getDepartmentLabel = (department) => {
  const labels = {
    'technical': 'Technique',
    'support': 'Support',
    'marketing': 'Marketing',
    'finance': 'Finance',
    'operations': 'Opérations'
  };
  return labels[department] || department || 'Non défini';
};

export const formatDate = (dateString) => {
  if (!dateString) return 'Jamais';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

