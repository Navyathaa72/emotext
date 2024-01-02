from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *
from django.shortcuts import get_object_or_404
from nltk.sentiment import SentimentIntensityAnalyzer
import nltk
nltk.download('vader_lexicon')
from textblob import TextBlob

class textview(APIView):
    serializer_class = textSerializer

    def get(self, request, pk=None):  # Accept the 'pk' parameter for the content ID
        if pk is None:
            outputs = [
                {"id": item.id, "name": item.name, "content": item.content}
                for item in text.objects.all()
            ]
            return Response(outputs)
        else:
            content = get_object_or_404(text, pk=pk)
            response_data = {
                "id": content.id,
                "name": content.name,
                "content": content.content,
            }
            return Response(response_data)

    def post(self, request):
        serializer = textSerializer(data=request.data)
        if serializer.is_valid():
            name = serializer.validated_data.get("name", None)
            if not name:
                content = serializer.validated_data.get("content", "")
                name = content[:25]  # Default to first 25 characters of content
            serializer.save(name=name)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print(serializer.errors)  # Print the serializer errors to console
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class YourViewName(APIView):
    serializer_class = TextAnalysisSerializer

    def get(self, request):
        outputs = TextAnalysis.objects.all()
        output_data = [
            {
                "des": output.des,
                "emotion": output.emotion
            }
            for output in outputs
        ]
        return Response(output_data)

    def post(self, request):
        serializer = TextAnalysisSerializer(data=request.data)
        if serializer.is_valid():
            text = serializer.validated_data['des']
            emotions = emotion_detection_nltk(text)

            # Save the emotions to the database
            serializer.save(emotion=emotions)

            # Convert emotions to text
            emotion_text = "\n".join([f"{emotion}: {score}" for emotion, score in emotions.items()])   

            # Predict the emotion
            predicted_emotion_tuple = self.predict_emotion(text)
            predicted_emotion_name, predicted_emotion_emoticon = predicted_emotion_tuple

            # Save the predicted emotion name and emoticon to the database
            serializer.save(predicted_emotion_name=predicted_emotion_name, predicted_emotion_emoticon=predicted_emotion_emoticon)       

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print(serializer.errors)  # Print the serializer errors to the console
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def predict_emotion(self, text):
        blob = TextBlob(text)
        sentiment = blob.sentiment.polarity

        if sentiment > 0.2:
            predicted_emotion = ("Positive", "😃")  # Positive emotion with emoticon
        elif sentiment < -0.2:
            predicted_emotion = ("Negative", "😔")  # Negative emotion with emoticon
        else:
            predicted_emotion = ("Neutral", "😐")  # Neutral emotion with emoticon
        
        return predicted_emotion
    
    
def emotion_detection_nltk(x):
    sid = SentimentIntensityAnalyzer()
    sentiment_scores = sid.polarity_scores(x)

    if sentiment_scores['pos'] != 0.0 or sentiment_scores['neg'] != 0.0:
        emotions = {
            'Positive': sentiment_scores['pos'],
            'Negative': sentiment_scores['neg'],
            'Neutral': 0.0
        }
    else:
        emotions = {
            'Positive': sentiment_scores['pos'],
            'Negative': sentiment_scores['neg'],
            'Neutral': sentiment_scores['neu']
        }

    if emotions['Positive'] != 0.0 or emotions['Negative'] != 0.0:
        emotions['Neutral'] = 0.0

    return emotions


