exports.handler = async (event) => {
    console.log('Querying New Relic for resources to get entity guids to use in mutations...')

    try {
        console.log('Querying for resources now...')
    } catch (err) {
        console.log('There was an error: ', err);
        return {
            statusCode: 500,
            body: event,
        }
    }

    return event,
}