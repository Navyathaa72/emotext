import React, { Component } from "react";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, ContentState } from "draft-js";
import axios from 'axios';
import Modal from 'react-modal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

export default class TextEditor extends Component {
  constructor(props) {
    super(props);
    const initialContent = this.props.initialContent || "";
    this.state = {
      editorState: EditorState.createWithContent(ContentState.createFromText(initialContent)),
      isListening: false,
      dictatedText: "",
      details: [],
      description: "",
      emotionsResult: null,
      isModalOpen: false,
      isReadingEmotions: false,
      originalEditorState: EditorState.createEmpty(),
    };

    this.recognition = new window.webkitSpeechRecognition();
    this.synth = window.speechSynthesis;
  }

  
  componentDidMount() {
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";

    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");

      const { editorState } = this.state;
      const newContentState = ContentState.createFromText(transcript);

      const newEditorState = EditorState.push(
        editorState,
        newContentState,
        "insert-characters"
      );

      this.setState({
        editorState: newEditorState,
        dictatedText: transcript,
      });
    };

    axios
      .get("http://localhost:8000/api/text/")
      .then((res) => {
        const data = res.data;
        this.setState({
          details: data,
        });
      })
      .catch((err) => {});

    axios
      .get("http://localhost:8000/api/your-endpoint/")
      .then((res) => {
        const data = res.data;
        this.setState({
          details: data,
        });
      })
      .catch((err) => {});
  }

  componentDidUpdate(prevProps) {
    
    const { initialContent } = this.props;

    console.log("Prev content:", prevProps.initialContent);
    console.log("New content:", initialContent);

    // Check if the initialContent prop has changed
    if (initialContent !== prevProps.initialContent) {
      const newEditorState = EditorState.createWithContent(
        ContentState.createFromText(initialContent)
      );

      // Update the editorState with the new content
      this.setState({
        editorState: newEditorState,
      });
    }
  }

  handleVoiceTyping = () => {
    const { isListening, editorState, dictatedText } = this.state;
  
    if (!isListening) {
      this.recognition.start();
    } else {
      this.recognition.stop();
  
      let updatedContent = editorState.getCurrentContent().getPlainText().trim();
  
      // Split the dictatedText into individual words or commands
      const commands = dictatedText.toLowerCase().split(" ");
  
      // Define a mapping of voice commands to their corresponding punctuation marks
      const commandToPunctuation = {
        period: '.',
        comma: ',',
        // Add more commands and their corresponding punctuation marks as needed
      };
  
      // Process each command in the sentence
      commands.forEach((command) => {
        if (command in commandToPunctuation) {
          const punctuation = commandToPunctuation[command];
          updatedContent += punctuation + ' ';
        } else {
          updatedContent += command + ' '; // If the command is not recognized, add it as-is
        }
      });
  
      // Update the editorState with the new content
      const newEditorState = EditorState.createWithContent(
        ContentState.createFromText(updatedContent)
      );
  
      this.setState({
        editorState: newEditorState,
        dictatedText: "", // Clear dictatedText after inserting punctuation
      });
    }
  
    this.setState((prevState) => ({
      isListening: !prevState.isListening,
    }));
  };
  
  
  
handleSubmit = (e) => {
  e.preventDefault();

  const { editorState } = this.state;
  const content = editorState.getCurrentContent().getPlainText();

  // Prompt the user to enter a name
  let saveName = window.prompt("Enter a name for saving:");

  // Use the default name if the user clicked "OK" with a blank name
  if (!saveName) {
    saveName = content.substring(0, 25); // Default name from content
  }

  fetch("http://127.0.0.1:8000/api/text/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: saveName, content }), // Use name and content
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Content saved:", data);
      this.props.setSavedData([...this.props.savedData, { id: data.id, content }]);
      console.log("Save successful");
    })
    .catch((error) => {
      console.error(error);
    });

  // Clear the saveName state after saving
  this.setState({
    saveName: "",
  });
};
  
  
  handleEmotion = (e) => {
    e.preventDefault();
  
    const { editorState } = this.state;
    const des = editorState.getCurrentContent().getPlainText();
  
    axios
      .post("http://localhost:8000/api/your-endpoint/", { des })
      .then((res) => {
        const emotionData = JSON.parse(res.data.emotion.replace(/'/g, '"'));
        const emotionsResult = Object.entries(emotionData).map(([key, value]) => ({
          label: key,
          value: value,
        }));
        const predictedEmotion = {
          name: res.data.predicted_emotion_name,
          emoticon: res.data.predicted_emotion_emoticon,
        };
        this.setState({
          emotionsResult: emotionsResult,
          predictedEmotion: predictedEmotion,
          originalEditorState: this.state.editorState,
          editorState: EditorState.createEmpty(),
          isModalOpen: true,
        });
        console.log("Save successful");
      })
      .catch((err) => {
        console.error(err);
      });
  };
  
  readEmotions = (emotions, predictedEmotion) => {
    // Toggle the state of isReadingEmotions
    this.setState((prevState) => ({
      isReadingEmotions: !prevState.isReadingEmotions,
    }), () => {
      // Callback function after state has been updated
      if (this.state.isReadingEmotions) {
        this.startReading(emotions, predictedEmotion);
      } else {
        this.stopReading();
      }
    });
  };
  
  startReading = (emotions, predictedEmotion) => {
    const positiveEmotions = emotions.filter((emotion) => emotion.value > 0);
  
    const introSentence = "Using NLTK Library";
    const emotionSentences = positiveEmotions.map((emotion) => {
      return `${emotion.label} with a score of ${emotion.value}.`;
    });
  
    const predictedEmotionSentence = predictedEmotion
      ? `Predicted emotion is ${predictedEmotion.name}.`
      : '';
  
    const combinedSentences = [
      introSentence,
      ...emotionSentences,
      "Using TextBlob Library",
      predictedEmotionSentence,
    ];
  
    combinedSentences.forEach((sentence) => {
      const utterance = new SpeechSynthesisUtterance(sentence);
      this.synth.speak(utterance); // Use the synth variable from the class
    });
  };
  
  stopReading = () => {
    this.synth.cancel(); // Stop ongoing speech synthesis
  };
  
  
  onEditorStateChange = (editorState) => {
    this.setState({
      editorState,
    });
  };

  closeResultModal = () => {
    this.setState({
      isModalOpen: false, // Close the modal
      editorState: this.state.originalEditorState,
    });
  }


  renderChart = () => {
    const { emotionsResult } = this.state;

    return (
      <BarChart width={400} height={300} data={emotionsResult}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    );
  };

  render() {
    const { editorState, isListening, emotionsResult, isModalOpen, predictedEmotion, isReadingEmotions} = this.state;

    return (
      <div>
        <Editor
          editorState={editorState}
          toolbarClassName="toolbarClassName"
          wrapperClassName="wrapperClassName"
          editorClassName="editorClassName"
          onEditorStateChange={this.onEditorStateChange}
        />
        <div className="toolbarClassName">
          <button className="my-button" onClick={this.handleVoiceTyping}>
            {isListening ? "Stop Voice Typing" : "Start Voice Typing"}
          </button>
          <div className="space"></div>
          <button className="my-button" onClick={this.handleEmotion}>
            Emotion
          </button>
          <div className="space"></div>
          <button className="my-button" onClick={this.handleSubmit}>
            Save
          </button>
        </div>
        <Modal
        isOpen={isModalOpen}
        onRequestClose={this.closeResultModal}
        contentLabel="Emotions Result Modal"
        className="modal-content"
      >
        <div className="graph-section">
          <h3 style={{ color: 'orange' }}>USING NLTK LIBRARY</h3>
          {emotionsResult && this.renderChart()}
        </div>
        <div className="modal-section">
          <h3 style={{ color: 'orange' }}>USING TEXTBLOB LIBRARY</h3>
          {predictedEmotion && (
            <div className="predicted-emotion">
              <p style={{ fontSize: '18px',color:'red' }}>Predicted Emotion: {predictedEmotion.name}</p>
              <p className="big-emoticon">{predictedEmotion.emoticon}</p>
            </div>
          )}
        </div>
        <div className="modal-buttons">
          <button className="my-buttons" onClick={() => this.readEmotions(emotionsResult, predictedEmotion)}>
            {isReadingEmotions ? "Stop Reading" : "Read Out Emotions"}
          </button>
          <div className="button-spacing"></div>
          <button className="my-buttons" onClick={this.closeResultModal}>
            Close
          </button>
        </div>
      </Modal>
      </div>
    );
  }
}