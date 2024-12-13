const express = require('express');
const router = express.Router();

// Example questions and audio source
const testData = {
  audioSource: '/files/Listening1_audio.mp3', // Path to the audio file
  questions: [
    { text: 'What is the main topic of the audio?' },
    { text: 'Who is the speaker in the audio?' },
    { text: 'What are the key points mentioned?' },
  ],
};

router.get('/', (req, res) => {
  res.render('listening-test', testData);
});

router.post('/submit-listening-test', async (req, res) => {
  const { answers } = req.body;

  try {
    console.log('User Answers:', answers);
    // Save answers to database or process results here
    res.status(200).send('Listening test submitted successfully.');
  } catch (error) {
    console.error('Error submitting listening test:', error);
    res.status(500).send('Error submitting test.');
  }
});

module.exports = router;
