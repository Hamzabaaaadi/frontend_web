// ===============================
// Service d'authentification
// ===============================

export async function login(email, password) {
  try {
    console.log('login', email, password);

    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST', // ✅ correction ici
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('response', response);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Erreur de connexion' }));
      throw new Error(errorData.message || 'Email ou mot de passe incorrect');
    }

    const data = await response.json();

    // ✅ IMPORTANT : stocker le Basic Auth
    const basicAuth = btoa(email + ':' + password);
    localStorage.setItem('basicAuth', basicAuth);

    // (optionnel) stocker l'utilisateur
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (err) {
    // Fallback demo si l'API n'est pas dispo
    if (
      err.message.includes('Failed to fetch') ||
      err.message.includes('Network')
    ) {
      console.warn('authService.login: API non disponible, fallback demo');

      if (email === 'coordinateur@demo.com' && password === 'demo') {
        return { role: 'COORDINATEUR', user: { email, role: 'COORDINATEUR' } };
      } else if (email === 'auditeur@demo.com' && password === 'demo') {
        return { role: 'AUDITEUR', user: { email, role: 'AUDITEUR' } };
      } else if (email === 'superadmin@demo.com' && password === 'demo') {
        return { role: 'SUPER_ADMIN', user: { email, role: 'SUPER_ADMIN' } };
      }

      throw new Error('Email ou mot de passe incorrect');
    }

    throw err;
  }
}

// ===============================
// Logout (Basic Auth)
// ===============================
export function logout() {
  // ✅ En Basic Auth, logout = suppression locale
  localStorage.removeItem('basicAuth');
  localStorage.removeItem('user');
}

// ===============================
// Profil utilisateur connecté
// ===============================
export async function 
getMyProfile() {
  const basicAuth = localStorage.getItem('basicAuth');

  if (!basicAuth) {
    throw new Error('Utilisateur non connecté');
  }

  const res = await fetch('http://localhost:5000/api/users/me', {
    method: 'GET',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Non authentifié');
  }

  return res.json();
}

export default {
  login,
  logout,
  getMyProfile,
};

















// // Service d'authentification
// export async function login(email, password) {
//   try {
//     console.log('login', email, password);
//     const response = await fetch('http://localhost:5000/api/auth/login', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ email, password }),
//     });
//     console.log('response', response);

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({ message: 'Erreur de connexion' }));
//       throw new Error(errorData.message || 'Email ou mot de passe incorrect');
//     }

//     const data = await response.json();
//     return data;
//   } catch (err) {
//     // Fallback vers la logique demo si l'API n'est pas disponible
//     if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
//       console.warn('authService.login: API non disponible, fallback vers demo');
//       // Logique de fallback pour les démos
//       if (email === 'coordinateur@demo.com' && password === 'demo') {
//         return { role: 'coordinateur', user: { email, role: 'coordinateur' } };
//       } else if (email === 'auditeur@demo.com' && password === 'demo') {
//         return { role: 'auditeur', user: { email, role: 'auditeur' } };
//       } else if (email === 'superadmin@demo.com' && password === 'demo') {
//         return { role: 'superadmin', user: { email, role: 'superadmin' } };
//       }
//       throw new Error('Email ou mot de passe incorrect');
//     }
//     throw err;
//   }
// }

// export async function logout() {
//   try {
//     await fetch('/api/auth/logout', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//   } catch (err) {
//     console.warn('authService.logout: erreur lors de la déconnexion', err.message);
//   }
// }

// export default {
//   login,
//   logout,
// };


// export async function getMyProfile() {
//   const res = await fetch('http://localhost:5000/api/users/me', {
//     headers: {
//       Authorization: 'Basic ' + localStorage.getItem('basicAuth')
//     }
//   });

//   if (!res.ok) throw new Error('Non authentifié');
//   return res.json();
// }

