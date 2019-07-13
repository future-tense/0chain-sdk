
import 'isomorphic-fetch';
import withQuery from 'with-query';

export async function get(url, params) {

    const res = await fetch(withQuery(url, params));
    if (!res.ok) {
        throw await res.json();
    }

    return res.json();
}

export async function post(url, data) {

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        throw await res.json();
    }

    return res.json();
}
