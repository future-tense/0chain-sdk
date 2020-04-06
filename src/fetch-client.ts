
import 'isomorphic-fetch';
import withQuery from 'with-query';

/**
 * Perform a GET HTTP request
 *
 * @internal
 * @param url -
 * @param params -
 */
export async function get(url, params) {

    const res = await fetch(withQuery(url, params));
    const t = await res.json();
    if (!res.ok) {
        throw t;
    }

    return t;
}

/**
 * Perform a POST HTTP request
 *
 * @internal
 * @param url -
 * @param data -
 */
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
