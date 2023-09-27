export async function getSalt(jwtToken: string): Promise<string> {
    const response = await fetch('http://salt.api-devnet.mystenlabs.com/get_salt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'token': jwtToken
        })
    });

    const json_resp = await response.json();
    return json_resp['salt'];
}

