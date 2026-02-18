import { json } from '@sveltejs/kit';
import { getTenantConfig } from '$lib/config/tenants';

const EASYBROKER_API_URL = 'https://api.easybroker.com/v1';

export async function GET({ url, request }) {
  const propertyId = url.searchParams.get('id');
  const host = request.headers.get('host');
  const tenant = getTenantConfig(host);
  
  if (!propertyId) {
    return json({ error: 'Missing id parameter' }, { status: 400 });
  }

  if (!tenant || !tenant.easyBrokerKey) {
    return json({ error: 'Tenant configuration missing' }, { status: 500 });
  }

  try {
    let url = `${EASYBROKER_API_URL}/properties`;
    if (propertyId) {
      url += `/${propertyId}`;
    } else {
      url += `?page=1&limit=1`;
    }

    const response = await fetch(url, {
      headers: {
        'X-Authorization': tenant.easyBrokerKey
      }
    });

    if (!response.ok) {
      // Check if response is HTML (which indicates "Inactive Website" or similar errors)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
         return json({
            error: 'EasyBroker returned an HTML error page. This usually means the API Key is invalid, the account is suspended, or the endpoint is wrong.',
            htmlPreview: (await response.text()).substring(0, 200) + '...'
         }, { status: response.status });
      }

      return json({ 
        error: `EasyBroker API error: ${response.status} ${response.statusText}`,
        details: await response.text()
      }, { status: response.status });
    }

    const data = await response.json();
    return json({
        status: 'success',
        mode: propertyId ? 'single_property' : 'list_test',
        data: data
    });
    
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
}
