from flask import Flask, request
from flask_cors import CORS

from data_parser_util import DataParserUtil

app = Flask(__name__)

# apply cors
CORS(app)


data_util = DataParserUtil()
data_util.load_data()

@app.route("/")
def get_request():
    return "Use /load to load the data and /apply_filters to get the filtered data!"


@app.route("/get_options")
def get_options():
    return data_util.get_options()


@app.route("/apply_filters", methods=['POST'])
def apply_filters():
    # get the data from the post requests body
    filters = request.json

    filtered_df = data_util.apply_filters(filters)
    return data_util.get_probabilities(filtered_df)

@app.route("/load")
def load_data():
    data_util.load_data()
    return "Data loaded!"


if __name__ == "__main__":
    app.run(debug=True)