const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || null;

/**
 * Asynchronously fetches properties from the API domain.
 *
 * @returns {Promise} A Promise that resolves with the fetched properties data.
 * @throws {Error} When the response status is not OK. Possible errors: 'Property not found.', 'Server error occurred.', 'Failed to fetch data.'
 */
async function fetchProperties() {
  try {
    const res = await fetch(`${apiDomain}/properties`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Property not found.');
      } else if (res.status === 500) {
        throw new Error('Server error occurred.');
      } else {
        throw new Error('Failed to fetch data.');
      }
    }

    return await res.json();
  } catch (error) {
    console.log(error);
  }
}

export { fetchProperties };
