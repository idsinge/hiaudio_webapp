import { ENDPOINT } from './config'


function getJsonApi(enpoint, on_ok, on_ko) {

    fetch(ENDPOINT + enpoint, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    }).then((r) => {

        if (!r.ok) {
            return on_ko ? on_ko(r.statusText) : null ;
        }
        return r.json();

    }).then(data => {

        return on_ok ? on_ok(data) : null ;

    }).catch((error) => {

        return on_ko ? on_ko(error) : null ;
    })

}


module.exports = {
    getJsonApi: getJsonApi,
}