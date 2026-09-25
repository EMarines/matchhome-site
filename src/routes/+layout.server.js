export function load({ locals, url, cookies }) {
  const contactId = url.searchParams.get('c') || url.searchParams.get('contact_id') || cookies.get('mh_contact_id') || '';
  return {
    tenant: locals.tenant,
    contactId
  };
}
