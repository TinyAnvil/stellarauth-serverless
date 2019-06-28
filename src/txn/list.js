import { headers, getAuth, parseError, StellarSdk } from '../js/utils'
import { Pool } from '../js/pg'
import _ from 'lodash'

export default async (event, context) => {
  try {
    const h_auth = getAuth(event)

    const userKeypair = StellarSdk.Keypair.fromSecret(h_auth)

    const pgTxns = await Pool.query(`
        select * from txns
        where _user='${userKeypair.publicKey()}'
      `).then((data) => _
        .chain(data)
        .get('rows')
        .map('xdr')
        .value()
      )

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ txns: pgTxns })
    }
  }

  catch(err) {
    return parseError(err)
  }
}