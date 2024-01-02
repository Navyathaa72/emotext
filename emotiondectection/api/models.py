from django.db import models

class text(models.Model):
    name = models.CharField(max_length=255, default="", blank=True)  # Allow blank for the default value
    content = models.TextField()

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # If name is not set, use the first 25 characters of content
        if not self.name and self.content:
            self.name = self.content[:25]
        super(text, self).save(*args, **kwargs)

class TextAnalysis(models.Model):
    des = models.TextField()
    emotion = models.CharField(max_length=50, default='')
    predicted_emotion_name = models.CharField(max_length=50, default='')  # New field
    predicted_emotion_emoticon = models.CharField(max_length=10, default='')  # New field

    def __str__(self):
        return self.des

