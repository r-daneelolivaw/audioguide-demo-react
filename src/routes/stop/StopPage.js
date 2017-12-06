import React from 'react';
import PropTypes from 'prop-types';
import ReactAudioPlayer from 'react-audio-player';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './StopPage.css';
import Link from '../../components/Link';
import AudioQuiz from '../../components/AudioQuiz';
import { JSON_API_URL } from '../../constants/env';

class StopPage extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    itineraryId: PropTypes.string.isRequired,
    stop: PropTypes.shape({
      data: PropTypes.shape({
        id: PropTypes.string.isRequired,
      }).isRequired,
      included: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
        }).isRequired,
      ).isRequired,
    }).isRequired,
  };

  mp3Url() {
    const stop = this.props.stop;
    // Get the (single) mp3 file Url from the stop.
    const mp3Id = stop.data.relationships.field_mp3.data.id;
    const mp3 = stop.included.filter(obj => obj.id === mp3Id);
    return `${JSON_API_URL}/${mp3[0].attributes.url}`;
  }

  imageUrl() {
    const stop = this.props.stop;
    // Get the (single) image file Url from the stop.
    const imageId = stop.data.relationships.field_image.data.id;
    const image = stop.included.filter(obj => obj.id === imageId);
    return `${JSON_API_URL}/${image[0].attributes.url}`;
  }

  answersList() {
    const stop = this.props.stop;
    // Get the answers (field_audio_answer Paragraphs).
    // Prepare the data model to be used by the AudioAnswer component.
    // @todo use typing instead of array
    const answersList = [];
    stop.data.relationships.field_audio_answer.data.forEach(answerReference => {
      const answerParagraphItemId = answerReference.id;
      const answerParagraphItem = stop.included.filter(
        obj => obj.id === answerParagraphItemId,
      );
      if (!(answerParagraphItem[0].relationships.field_mp3.data === null)) {
        // Then, for each answer, get its (single) mp3 file.
        // @todo refactoring needed
        const answerMp3Id =
          answerParagraphItem[0].relationships.field_mp3.data.id;
        const answerMp3 = stop.included.filter(obj => obj.id === answerMp3Id);
        const answerMp3URL = `${JSON_API_URL}/${answerMp3[0].attributes.url}`;
        // Prepare the wrapper and store in the list.
        const answer = {
          title: answerParagraphItem[0].attributes.field_title,
          text: answerParagraphItem[0].attributes.field_text.value,
          mp3URL: answerMp3URL,
          uuid: answerParagraphItem[0].attributes.uuid,
        };
        answersList.push(answer);
      }
    });
    return answersList;
  }

  render() {
    const { itineraryId, stop } = this.props;
    const answersList = this.answersList();

    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>
            <span className={s.audioId}>
              {stop.data.attributes.field_id}
            </span>
            <span className={s.audioTitle}>
              {this.props.title} -
              {stop.data.attributes.title}
            </span>
          </h1>
          <Link to={`/itinerary/${itineraryId}`}>Back to itinerary</Link>
          <img src={this.imageUrl()} alt={stop.data.attributes.title} />
          <ReactAudioPlayer src={this.mp3Url()} autoPlay controls />
          <div
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: stop.data.attributes.body.value,
            }}
          />
          {answersList.length > 0
            ? <AudioQuiz answersList={answersList} />
            : <div />}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(StopPage);
