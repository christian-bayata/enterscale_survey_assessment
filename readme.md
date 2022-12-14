# enterscale_survey_assessment

> A company requires you to build a secured survey server that allows an admin to roll out surveys. The API was built with Node JS, MongoDB, mongoose ORM

| PROJECT FEATURE                                             |       STATUS       |
| :---------------------------------------------------------- | :----------------: |
| Sign Up                                                     | :white_check_mark: |
| Login                                                       | :white_check_mark: |
| Password Reset                                              | :white_check_mark: |
| Company Create Survey(s)                                    | :white_check_mark: |
| End User(s) Retrieves Survey                                | :white_check_mark: |
| End User(s) Respond To Survey                               | :white_check_mark: |
| Company Retrieve All Questions And Responses By An End-User | :white_check_mark: |
| Test Driven Development                                     | :white_check_mark: |
| Test Coverage Reporting                                     | :white_check_mark: |
| Micro service Architecture                                  | :white_check_mark: |
| Background Services in RabbitMQ                             | :white_check_mark: |

- :cop: Authentication via [JWT](https://jwt.io/)
- Routes mapping via [express-router](https://expressjs.com/en/guide/routing.html)
- Documented using [Swagger](https://swagger.io). Find link to docs [here](http://206.189.227.235/api-docs)
- Background operations are run on [fund-me-background-service](https://github.com/christian-bayata/fundMe.git). Btw it is a public repo and is easily accessible.
- Uses [MongoDB](https://www.mongodb.com) as database.
- [Mongoose](https://mongoosejs.com) as object document model
- Environments for `development`, `test`, and `production`
- Unit and Integration tests running with [Jest](https://github.com/facebook/jest)
- Built with [yarn scripts](#npm-scripts)
- Uses [Elastic Search](https://www.elastic.co/products/elasticsearch) for search operations
- example for User model and User controller, with jwt authentication, simply type `yarn start`
