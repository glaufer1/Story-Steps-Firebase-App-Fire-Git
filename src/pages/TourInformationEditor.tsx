import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db } from '../firebaseConfig';
import type { Tour } from '../interfaces';
import Editor from 'react-simple-wysiwyg';
import './TourEditorPage.css';

const TourInformationEditor: React.FC = () => {
  const { tourId } = useParams<{ tourId: string }>();
  const [tour, setTour] = useState<Tour | null>(null);
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [description, setDescription] = useState('');
  const [additionalTourText, setAdditionalTourText] = useState('');
  const [tourPreviewAudio, setTourPreviewAudio] = useState<string | null>(null);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  const fetchTour = useCallback(async () => {
    if (!tourId) return;
    setLoading(true);
    try {
      const tourDocRef = doc(db, 'tours', tourId);
      const tourDocSnap = await getDoc(tourDocRef);
      if (tourDocSnap.exists()) {
        const tourData = tourDocSnap.data() as Tour;
        setTour(tourData);
        setTitle(tourData.title || '');
        setSubTitle(tourData.subTitle || '');
        setDescription(tourData.description || '');
        setAdditionalTourText(tourData.additionalTourText || '');
        setTourPreviewAudio(tourData.tourPreviewAudio || null);
        setLocalAudioUrl(tourData.tourPreviewAudio || null);
        setFileName(tourData.tourPreviewAudioFileName || '');
      } else {
        setError('Tour not found.');
      }
    } catch (err) {
      setError('Failed to fetch tour data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tourId]);

  useEffect(() => {
    fetchTour();
  }, [fetchTour]);

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !tourId) return;

    console.log('Starting audio upload...');
    setLocalAudioUrl(URL.createObjectURL(file));
    setUploading(true);
    setUploadSuccess(false);
    setUploadProgress(0);
    setError('');

    const storage = getStorage();
    const storageRef = ref(storage, `tours/${tourId}/tour-preview-audio/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        setError('Upload failed. Please try again.');
        setUploading(false);
      },
      () => {
        console.log('Upload complete. Getting download URL...');
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log('File available at', downloadURL);
          setTourPreviewAudio(downloadURL);
          setLocalAudioUrl(downloadURL);
          setFileName(file.name);
          setUploadSuccess(true);
          setUploading(false);
        });
      }
    );
  };

  const handleAudioDelete = async () => {
    if (!tourId || !tourPreviewAudio) return;

    const storage = getStorage();
    const storageRef = ref(storage, tourPreviewAudio);

    try {
      await deleteObject(storageRef);
      setTourPreviewAudio(null);
      setLocalAudioUrl(null);
      setFileName('');
      setUploadSuccess(false);
      const tourDocRef = doc(db, 'tours', tourId);
      await updateDoc(tourDocRef, {
        tourPreviewAudio: null,
        tourPreviewAudioFileName: null,
      });
      alert('Audio file deleted successfully!');
    } catch (error) {
      console.error('Error deleting audio file:', error);
      setError('Failed to delete audio file.');
    }
  };

  const handleSave = async () => {
    if (!tourId) return;
    console.log('Saving tour data...');
    setSaving(true);
    try {
      const tourDocRef = doc(db, 'tours', tourId);
      await updateDoc(tourDocRef, {
        title,
        subTitle,
        description,
        additionalTourText,
        tourPreviewAudio,
        tourPreviewAudioFileName: fileName,
      });
      alert('Tour information updated successfully!');
      if (tour) {
        setTour({
          ...tour,
          title,
          subTitle,
          description,
          additionalTourText,
          tourPreviewAudio: tourPreviewAudio || undefined,
          tourPreviewAudioFileName: fileName || undefined
        });
      }
    } catch (err) {
      setError('Failed to save tour data.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seek = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlaying = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [localAudioUrl]);

  if (loading) return <p>Loading tour information...</p>;
  if (error && !uploading) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="tour-editor-container">
      <h2>Tour Editing Information:</h2>
      <h3>{tour?.title}</h3>
      
      <div className="form-group">
        <label htmlFor="title">Tour Title</label>
        <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="form-group">
        <label htmlFor="subTitle">Tour Sub Title</label>
        <input id="subTitle" type="text" value={subTitle} onChange={(e) => setSubTitle(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Tour Preview Audio</label>
        {!localAudioUrl ? (
          <div className="audio-upload-container">
            <input type="file" accept="audio/*" onChange={handleAudioUpload} disabled={uploading} />
          </div>
        ) : (
          <div className="audio-preview-container">
            <audio ref={audioRef} src={localAudioUrl} key={localAudioUrl} style={{ display: 'none' }} />
            <div className="audio-controls">
              <button onClick={() => seek(-10)}>« 10s</button>
              <button onClick={togglePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
              <button onClick={() => seek(10)}>10s »</button>
            </div>
            <div className="file-info">
              <span>{fileName}</span>
              <button onClick={handleAudioDelete} className="delete-button">Delete</button>
            </div>
          </div>
        )}
        {uploading && (
          <div>
            <p>Uploading: {Math.round(uploadProgress)}%</p>
            <progress value={uploadProgress} max="100" />
          </div>
        )}
        {uploadSuccess && <p className="success-message">File uploaded! Click "Save Changes" to commit.</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Tour Description</label>
        <Editor value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="form-group">
        <label htmlFor="additionalTourText">Additional Tour Text</label>
        <Editor value={additionalTourText} onChange={(e) => setAdditionalTourText(e.target.value)} />
      </div>

      <button onClick={handleSave} disabled={saving || uploading}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
};

export default TourInformationEditor;
