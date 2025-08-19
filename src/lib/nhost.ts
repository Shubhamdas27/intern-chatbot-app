import { NhostClient } from '@nhost/react';

// Use environment variables with fallback values
const nhostSubdomain = import.meta.env.VITE_NHOST_SUBDOMAIN || 'ydlyymwjtginkbgcbddv';
const nhostRegion = import.meta.env.VITE_NHOST_REGION || 'ap-south-1';

console.log('🔧 Nhost Config:', { 
  subdomain: nhostSubdomain, 
  region: nhostRegion,
  authUrl: `https://${nhostSubdomain}.auth.${nhostRegion}.nhost.run`,
  hasuraUrl: `https://${nhostSubdomain}.hasura.${nhostRegion}.nhost.run/v1/graphql`,
  environment: import.meta.env.MODE
});

export const nhost = new NhostClient({
  subdomain: nhostSubdomain,
  region: nhostRegion,
  // Add client options for better debugging
  clientStorageType: 'web',
});

// Test connection
nhost.auth.onAuthStateChanged((event, session) => {
  console.log('🔐 Auth State Changed:', { event, session: !!session });
});

export default nhost;