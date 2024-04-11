import replicate
from PIL import Image
import io 
import base64
from openai import OpenAI

weather_api = "0be641e1bbc1e83e986d8bb183d6a10c"
os.environ['OPENAI_API_KEY'] = st.secrets['OPENAI_API_KEY']
os.environ['REPLICATE_API_TOKEN'] = st.secrets['REPLICATE_API_TOKEN']

import requests


client = OpenAI(api_key=api_key)

def encode_image(image):
    buffered = io.BytesIO()
    if image.mode in ("RGBA", "LA"):
        background = Image.new(image.mode[:-1], image.size, (255, 255, 255))
        background.paste(image, image.split()[-1])  # Paste the image using the alpha channel as a mask
        image = background.convert("RGB")
    image.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return img_str

import streamlit as st
from streamlit_option_menu import option_menu

st.set_page_config(
    page_title="DressSense.AI",
    layout="wide",
    initial_sidebar_state="expanded",
    page_icon="dress"
)

sidebar_style = """
<style>
html, body, [data-testid="stSidebar"] > div:first-child, .css-1d391kg {
    font-size: 18px;  /* Increase the base font size */
}
</style>
"""

# Inject CSS with Markdown
st.markdown(sidebar_style, unsafe_allow_html=True)

# Sidebar
with st.sidebar:
    selected = option_menu('DressSense.AI', ["Outfit Recommender", 'Outfit Reviewer', 'Hairstyle Checker', 'Chatbot - Miffy'], 
                           icons=['bi-symmetry-horizontal', 'person-raised-hand', 'fingerprint', 'robot'], default_index=0)

        
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



def generate_outfit_recommendations( weather_condition,color_preference,occasion, comfort_level,other_comments,gender):

    payload = {
        "model": "gpt-3.5-turbo-instruct",
        "prompt": f"Given the weather conditon :{weather_condition}, color preference: {color_preference} (you don't need to only use this color, just use it for one of the outfits), comfort level : {comfort_level}, occasion:{occasion} and other comments(if any): {other_comments} Suggest exactly three different outfits for males  make sure to only use clothes given in the descriptions with their exact colors and styles and not anything else while taking into account clothes that would suit the weather conditions and numbered as 1. then 2. then 3. . keep each recommendation short(maybe 5-10 words max)",
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



def generateoutfits(color_pref,gender,occasion,comfort_level,other_comments):

    
    
    if not (color_pref and occasion and other_comments):
        return {"error": "Missing data for color preference, occasion, or other comments"}, 400

    weather_condition = fetch_weather(weather_api)


    recommendations = generate_outfit_recommendations( weather_condition,color_pref,occasion,comfort_level,other_comments,gender)
    print(recommendations)
    if not recommendations:
        return {"error": "Could not generate outfit recommendations"}, 400

    result = split_reccomendation(recommendations)
    if not result:
        return {"error": "Not enough outfit recommendations found"}, 400

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
    dict = {
        "message": "Outfits generated successfully",
        "outfits": urls
    }
    return dict, 200

if selected == "Outfit Recommender":
    st.title('Outfit Recommender')
    gender = st.text_input("Enter gender :")
    occasion = st.text_input("Enter occasion:")
    color = st.text_input("Enter color of your choice:")
    comfort_level = st.text_input("Enter comfort level from 1-5:")
    other_comments = st.text_input("Enter any other comments")
    dict1, status = generateoutfits(color,gender,occasion,comfort_level,other_comments)
    if dict1:
        list1 = dict1["outfits"]
    for i in list1:
        st.image(i, caption='Outfit', use_column_width=True)






elif selected == "Outfit Reviewer":
    st.subheader('Outfit Reviewer')
    uploaded_file = st.file_uploader("Upload an image of your outfit for review", type=["jpg", "jpeg", "png"])
    def outfit_rater_page(uploaded_file):
        st.subheader("Outfit Rater")
        # Placeholder for outfit rater functionality
        if uploaded_file is not None:
            image = Image.open(uploaded_file)
        try:
            base64_image = encode_image(image)
        except:
            return 
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
                            "text": "can you rate this outfit for all occasions  and maybe suggest changes to this outfit to make it look better "
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
        return image, description_data
    image,description_data = outfit_rater_page(uploaded_file)
    st.image(image, caption='Uploaded Image', use_column_width=True)
    if description_data:
        st.write(description_data)


# About Page
elif selected == "Hairstyle Checker":
    st.title('Hairstyle Checker')
    uploaded_file = st.file_uploader("Upload an image of your outfit for review", type=["jpg", "jpeg", "png"])
    style = st.text_input("Enter style of your choice:")

    if uploaded_file is not None:
        # Read the file directly from the UploadedFile object
        file_bytes = uploaded_file.getvalue()
        data = base64.b64encode(file_bytes).decode('utf-8')
        image = f"data:image/jpeg;base64,{data}"

        input = {
            "image": image,
            "editing_type": "both",
            "color_description": "black",
            "hairstyle_description": style
        }

        output = replicate.run(
            "wty-ustc/hairclip:b95cb2a16763bea87ed7ed851d5a3ab2f4655e94bcfb871edba029d4814fa587",
            input=input
        )

        # Display the image
        st.image(output, caption="Example Image", use_column_width=True)


elif selected == "Chatbot - Miffy":
    st.title("Chatbot - Miffy")
    user_input = st.text_input("Enter message:")
    def update_chat(user_input):
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
            except requests.exceptions.RequestException as e:
                answer = "Sorry, I am unable to respond at this moment."
        return {"reply": answer}, 200
    answer, status = update_chat(user_input)
    st.write(answer["reply"])
