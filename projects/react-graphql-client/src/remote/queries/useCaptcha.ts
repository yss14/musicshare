import { Captcha } from "@musicshare/shared-types"
import gql from "graphql-tag"
import { useGraphQLQuery, TransformedGraphQLQuery, IGraphQLQueryOpts } from "../../react-query-graphql"

export interface IGetCaptchaData {
	captcha: Captcha
}

export const GET_CAPTCHA = TransformedGraphQLQuery<IGetCaptchaData>(gql`
	query captcha {
		captcha {
			id
			image
		}
	}
`)((data) => data.captcha)

export const useCaptcha = (opts?: IGraphQLQueryOpts<typeof GET_CAPTCHA>) => {
	const query = useGraphQLQuery(GET_CAPTCHA, { staleTime: 300e3, ...opts })

	return query
}
