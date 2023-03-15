const path = require('path');
const express = require('express');

const router = express.Router();

module.exports = (params) => {
  const { speakersService } = params;

  router.get('/', async (req, res, next) => {
    try {
      const speakers = await speakersService.getList();
      const artworks = await speakersService.getAllArtwork();
      // console.log(artworks);
      return res.render('layout/home.ejs', {
        pageTitle: 'Speakers',
        template: 'speakers',
        speakers,
        artworks,
      });
    } catch (error) {
      next(error);
    }

    // res.sendFile(path.join(__dirname, '../static/speakers.html'));
  });

  router.get('/:shortname', async (req, res) => {
    const speaker = await speakersService.getSpeaker(req.params.shortname);
    const artworks = await speakersService.getArtworkForSpeaker(req.params.shortname);
    // console.log(speaker);
    return res.render('layout/home.ejs', {
      pageTitle: 'Speakers',
      template: 'speaker-detail',
      speaker,
      artworks,
    });
  });
  return router;
};
