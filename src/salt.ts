// import { JWT_TOKEN } from "./priv_const";

export async function getSalt(jwtToken: string): Promise<string> {

    const response = await fetch('https://salt.api.mystenlabs.com/get_salt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: jwtToken
        })
    });

    if (!response.ok) {
        if (response.status === 422) {
            // Handle 422 validation errors
            const errorData = await response.text(); // Parse error response
            console.error('Validation Errors:', errorData);
            // You can display error messages to the user here
        } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    }

    const responseJson = await response.json();
    return responseJson["salt"]
}

// getSalt(JWT_TOKEN);

