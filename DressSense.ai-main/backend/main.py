
import os
from PIL import Image
import io
import base64
import requests
from openai import OpenAI
import psycopg2
from flask import Flask, request, jsonify
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

import json
import copy

import MarketplaceScraper



GRAPHQL_URL = "https://www.facebook.com/api/graphql/"
GRAPHQL_HEADERS = {
    "sec-fetch-site": "same-origin",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36"
}


def getListings(listingQuery, numPageResults=1):
    data = {}
    rawPageResults = []  # Un-parsed list of JSON results from each page

    requestPayload = {
        "variables": """{"count":24, "params":{"bqf":{"callsite":"COMMERCE_MKTPLACE_WWW","query":"%s"},"browse_request_params":{"commerce_enable_local_pickup":true,"commerce_enable_shipping":true,"commerce_search_and_rp_available":true,"commerce_search_and_rp_condition":null,"commerce_search_and_rp_ctime_days":null,"filter_location_latitude": 1.3521,"filter_location_longitude":103.8198,"filter_price_lower_bound":0,"filter_price_upper_bound":214748364700,"filter_radius_km":16},"custom_request_params":{"surface":"SEARCH"}}}""" % (listingQuery),
        "doc_id": "7111939778879383"
    }

    status, error, facebookResponse = getFacebookResponse(requestPayload)

    if (status == "Success"):
        facebookResponseJSON = json.loads(facebookResponse.text)
        rawPageResults.append(facebookResponseJSON)

        # Retrieve subsequent page results if numPageResults > 1
        for _ in range(1, numPageResults):
            pageInfo = facebookResponseJSON["data"]["marketplace_search"]["feed_units"]["page_info"]

            # If a next page of results exists
            if (pageInfo["has_next_page"]):
                cursor = facebookResponseJSON["data"]["marketplace_search"]["feed_units"]["page_info"]["end_cursor"]

                # Make a copy of the original request payload
                requestPayloadCopy = copy.copy(requestPayload)

                # Insert the cursor object into the variables object of the request payload copy
                requestPayloadCopy["variables"] = requestPayloadCopy["variables"].split(
                )
                requestPayloadCopy["variables"].insert(
                    1, """"cursor":'{}',""".format(cursor))
                requestPayloadCopy["variables"] = "".join(
                    requestPayloadCopy["variables"])

                status, error, facebookResponse = getFacebookResponse(
                    requestPayloadCopy)

                if (status == "Success"):
                    facebookResponseJSON = json.loads(facebookResponse.text)
                    rawPageResults.append(facebookResponseJSON)
                else:
                    return (status, error, data)
    else:
        return (status, error, data)

    # Parse the raw page results and set as the value of listingPages
    data["listingPages"] = parsePageResults(rawPageResults)
    return (status, error, data)


# Helper function
def getFacebookResponse(requestPayload):
    status = "Success"
    error = {}

    # Try making post request to Facebook, excpet return
    try:
        facebookResponse = requests.post(
            GRAPHQL_URL, headers=GRAPHQL_HEADERS, data=requestPayload)
        print(f"Raw Facebook response: {facebookResponse.text}")
    except requests.exceptions.RequestException as requestError:
        status = "Failure"
        error["source"] = "Request"
        error["message"] = str(requestError)
        facebookResponse = None
        return (status, error, facebookResponse)

    if (facebookResponse.status_code == 200):
        facebookResponseJSON = json.loads(facebookResponse.text)

        if (facebookResponseJSON.get("errors")):
            status = "Failure"
            error["source"] = "Facebook"
            error["message"] = facebookResponseJSON["errors"][0]["message"]
    else:
        status = "Failure"
        error["source"] = "Facebook"
        error["message"] = "Status code {}".format(
            facebookResponse.status_code)

    return (status, error, facebookResponse)


# Helper function
def parsePageResults(rawPageResults):
    listingPages = []

    pageIndex = 0
    for rawPageResult in rawPageResults:

        # Create a new listings object within the listingPages array
        listingPages.append({"listings": []})

        for listing in rawPageResult["data"]["marketplace_search"]["feed_units"]["edges"]:

            # If object is a listing
            if (listing["node"]["__typename"] == "MarketplaceFeedListingStoryObject"):
                listingID = listing["node"]["listing"]["id"]
                listingName = listing["node"]["listing"]["marketplace_listing_title"]
                listingCurrentPrice = listing["node"]["listing"]["listing_price"]["formatted_amount"]

                # If listing has a previous price
                if (listing["node"]["listing"]["strikethrough_price"]):
                    listingPreviousPrice = listing["node"]["listing"]["strikethrough_price"]["formatted_amount"]
                else:
                    listingPreviousPrice = ""

                listingSaleIsPending = listing["node"]["listing"]["is_pending"]
                listingPrimaryPhotoURL = listing["node"]["listing"]["primary_listing_photo"]["image"]["uri"]
                sellerName = listing["node"]["listing"]["marketplace_listing_seller"]["name"]
                sellerLocation = listing["node"]["listing"]["location"]["reverse_geocode"]["city_page"]["display_name"]
                sellerType = listing["node"]["listing"]["marketplace_listing_seller"]["__typename"]

                # Add the listing to its corresponding page
                listingPages[pageIndex]["listings"].append({
                    "id": listingID,
                    "name": listingName,
                    "currentPrice": listingCurrentPrice,
                    "previousPrice": listingPreviousPrice,
                    "saleIsPending": str(listingSaleIsPending).lower(),
                    "primaryPhotoURL": listingPrimaryPhotoURL,
                    "sellerName": sellerName,
                    "sellerLocation": sellerLocation,
                    "sellerType": sellerType
                })

        pageIndex += 1

    return listingPages




api_key = "api_key"
weather_api = "api_key"

client = OpenAI(api_key=api_key)

app = Flask(__name__)
CORS(app) 
# Fetch the service account key JSON file contents
cred = credentials.Certificate("backend/swee-ab4bc-firebase-adminsdk-dl955-b41acdb640.json")

# Initialize the app with a service account, granting admin privileges
firebase_admin.initialize_app(cred)
db = firestore.client()


# As an admin, the app has access to read and write all data, regradless of Security Rules
def encode_image(image):
    buffered = io.BytesIO()
    if image.mode in ("RGBA", "LA"):
        background = Image.new(image.mode[:-1], image.size, (255, 255, 255))
        background.paste(image, image.split()[-1])  # Paste the image using the alpha channel as a mask
        image = background.convert("RGB")
    image.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return img_str


@app.route('/addtocloset', methods=['POST'])

def add_to_your_closet():
    data = request.json
    if not data or 'image_url' not in data:
        return jsonify({"error": "No image URL provided"}), 400

    image_url = data['image_url']

    try:
        response = requests.get(image_url)
        response.raise_for_status()
        
        # Debug: Print the first few bytes of the response content
        print(response.content[:10])

        # Debug: Log the response headers
        print(response.headers)

    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

    # Try to open the image with a context manager to ensure the file-like object is properly managed
    try:
        with io.BytesIO(response.content) as image_file:
            image = Image.open(image_file)
            base64_image = encode_image(image)
            # ... rest of your code ...
    except Exception as e:
        return jsonify({"error": str(e)}), 500


    headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

    payload = {
        "model": "gpt-4-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "describe the features in the clothing in this image in 5-10 words ? try to as specific as possible with the design if any"
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 300
    }

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)

    data = response.json()
    print(data)
    description_data = data['choices'][0]['message']['content']
    return jsonify({"message": "File uploaded and processed successfully", "description": description_data}), 200

        
def fetch_weather(api_key):
    lat = "1.3521"
    lon = "103.8198"
    url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"

    response = requests.get(url)

    # Check if the request was successful
    if response.status_code == 200:
        data1 = response.json()
        try:
            main_weather = data1['weather'][0]['main']
            temperature = data1['main']['temp']

            if "Rain" in main_weather or "Drizzle" in main_weather or "Thunderstorm" in main_weather:
                weather_condition = "Rainy"
            elif temperature > 25:
                weather_condition = "Warm"
            else:
                weather_condition = "Cold"

            return weather_condition
        except KeyError:
            print(f"KeyError: Missing expected data in the response: {data1}")
            return None
    else:
        print(f"Failed to fetch weather data. Status Code: {response.status_code}, Response Text: {response.text}")
        return None

def fetch_all_clothing_items():
    conn = psycopg2.connect(
        dbname='postgres',
        user="postgres",
        password="bankai",
        host="localhost"
    )
    items = []
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT distinct description FROM  DressSense;")
            items = cur.fetchall()
    except Exception as e:
        print(f"Error fetching items: {e}")
    finally:
        conn.close()
    return items

def generate_outfit_recommendations(items, weather_condition,color_preference,occasion, comfort_level,other_comments,gender):
    descriptions = [item[0] for item in items]
    descriptions_str = " ".join(descriptions)
    payload = {
        "model": "gpt-3.5-turbo-instruct",
        "prompt": f"Given these clothing items: {descriptions_str},the weather conditon :{weather_condition}, color preference: {color_preference} (you don't need to only use this color, just use it for at least part of one of the outfits), comfort level : {comfort_level}, occasion:{occasion} and other comments(if any): {other_comments} Suggest exactly three different outfits for this gender : {gender}  make sure to only use clothes given in the descriptions with their exact colors and styles and not anything else while taking into account clothes that would suit the weather conditions and numbered as 1. then 2. then 3. . keep each recommendation short(maybe 5-10 words max)",
        "temperature": 0.5,
        "max_tokens": 150
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"  # Ensure this is the correct key
    }

    response = requests.post("https://api.openai.com/v1/completions", headers=headers, json=payload)

    if response.status_code == 200:
        response_data = response.json()
        try:
            return response_data['choices'][0]['text']
        except KeyError:
            print(f"KeyError: 'choices' not found in the response. Here's the response data: {response_data}")
            return None
    else:
        print(
            f"Failed to get a successful response from the API. Status Code: {response.status_code}, Response Text: {response.text}")
        return None

def split_reccomendation(recommendations):
    result = []
    split_string = [s.strip() for s in recommendations.split('\n') if s.strip().startswith(('1.', '2.', '3.'))]
    if len(split_string) >= 3:
        outfit_1 = split_string[0]
        outfit_2 = split_string[1]
        outfit_3 = split_string[2]
        result.append(outfit_1)
        result.append(outfit_2)
        result.append(outfit_3)
        return result

    else:
        print("Not enough outfit recommendations found.")
        return None



@app.route('/generateoutfits', methods=['POST']) 
def generateoutfits():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    color_pref = data.get('color_preference')
    occasion = data.get('occasion')
    comfort_level = data.get("comfort_level")
    gender = data.get("gender")
    other_comments = data.get('other_comments')
    
    if not (color_pref and occasion and other_comments):
        return jsonify({"error": "Missing data for color preference, occasion, or other comments"}), 400

    weather_condition = fetch_weather(weather_api)
    clothes_ref = db.collection('clothes')
    docs = clothes_ref.stream()
    clothes_ref = db.collection('clothes')

    docs = clothes_ref.stream() 
    descriptions = [doc.get('description') for doc in docs]
    print(descriptions)

    if not descriptions:
        return jsonify({"error": "No clothes descriptions found"}), 400

    recommendations = generate_outfit_recommendations(descriptions, weather_condition,color_pref,occasion,comfort_level,other_comments,gender)
    print(recommendations)
    if not recommendations:
        return jsonify({"error": "Could not generate outfit recommendations"}), 400

    result = split_reccomendation(recommendations)
    if not result:
        return jsonify({"error": "Not enough outfit recommendations found"}), 400

    urls = []
    for i in result:
        response = client.images.generate(
            model="dall-e-3",
            prompt=i + " put these clothes on a fully shown mannequin exactly as given in the description",
            quality="standard",
            n=1,
        )
        urls.append(response.data[0].url)
    print(urls)
    return jsonify({
        "message": "Outfits generated successfully",
        "outfits": urls
    }), 200




@app.route('/outfitsrater', methods=['POST']) 
def outfit_rater():
    data = request.json
    if not data or 'image_url' not in data:
        return jsonify({"error": "No image URL provided"}), 400

    image_url = data['image_url']

    try:
        response = requests.get(image_url)
        response.raise_for_status()
        
        # Debug: Print the first few bytes of the response content
        print(response.content[:10])

        # Debug: Log the response headers
        print(response.headers)

    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

    # Try to open the image with a context manager to ensure the file-like object is properly managed
    try:
        with io.BytesIO(response.content) as image_file:
            image = Image.open(image_file)
            base64_image = encode_image(image)
            # ... rest of your code ...
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

    payload = {
        "model": "gpt-4-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "can you rate this outfit out of 10 and then give feeback for all occasions  and maybe suggest changes to this outfit to make it look better, keep it brief between 45-50 words, if unable to rate just give very generic and general feedback for a random casual outfit"
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 300
    }

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)

    data = response.json()
    print(data)

    description_data = data['choices'][0]['message']['content']
    return jsonify({
        "description":description_data
    }),200




def encode_image(image):
    buffered = io.BytesIO()
    if image.mode in ("RGBA", "LA"):
        background = Image.new(image.mode[:-1], image.size, (255, 255, 255))
        background.paste(image, image.split()[-1])  # Paste the image using the alpha channel as a mask
        image = background.convert("RGB")
    image.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return img_str

@app.route("/marketplace", methods=["POST"])
def search():
    result = {}
    data = request.json
    print("data:",data)
    image_url = data['image_url']
    try:
        response = requests.get(image_url)
        response.raise_for_status()
        

    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500
    if not data or 'image_url' not in data:
        return jsonify({"error": "No image URL provided"}), 400


    
    try:
        with io.BytesIO(response.content) as image_file:
            image = Image.open(image_file)
            base64_image = encode_image(image)
            # ... rest of your code ...
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

    payload = {
        "model": "gpt-4-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "describe the features in the clothing in this image in 3 words for example if it's a red t shirt with a puma logo then just return red puma tshirt "
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 300
    }

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)

    data = response.json()

    description_data = data['choices'][0]['message']['content']

    if (description_data):
        status, error, data = getListings(description_data)
    else:
        status = "Failure"
        error["source"] = "User"
        error["message"] = "Missing required parameter(s)"
        data = {}

    result["status"] = status
    result["error"] = error
    result["data"] = data
    listings = result["data"]["listingPages"][0]["listings"][:10]


    extracted_data = [
        {
            "name": listing["name"],
            "currentPrice": listing["currentPrice"],
            "primaryPhotoURL": listing["primaryPhotoURL"]
        }
        for listing in listings
    ]
    print(extracted_data)
    print(type(extracted_data))
    return jsonify({
        "description":extracted_data
    }),200



@app.route("/chatbot", methods=["POST"])
def update_chat():
    data = request.json
    print(data)
    answer = "hello"
    user_input = data["Input"]
    print(user_input)
    if user_input:
        payload = {
            "model": "gpt-3.5-turbo-instruct",
            "prompt": f"Based on {user_input} generate a suitable response please answer the question to the best of your ability",
            "temperature": 0.5,
            "max_tokens": 150
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}" 
        }

        try:
            response = requests.post("https://api.openai.com/v1/completions", headers=headers, json=payload)
            response.raise_for_status() 
            response_data = response.json()
            print(response_data)
            answer = response_data['choices'][0]['text']
            answer = answer.lstrip('\n')
            answer = answer.lstrip(" ")
        except requests.exceptions.RequestException as e:
            answer = "Sorry, I am unable to respond at this moment."
    print(answer)
    return jsonify({"reply": answer}), 200

 


if __name__ == '__main__':
  app.run(host="0.0.0.0", port=5001, debug=True)  