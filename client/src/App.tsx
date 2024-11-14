
import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';

type typeLinkData = {
  format: string;
  url: string;
};

type loaderEnums = 'uploadLoading' | 'fetchUploadsLoading' | false;

const useStyles = createUseStyles({
  app: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1rem',
    gap: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  getSection: {
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
});

const App = () => {
  const classes = useStyles();
  const [links, setLinks] = useState<typeLinkData[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState<loaderEnums>(false);

  const onSubmitClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading('uploadLoading');
    const videofile = document.getElementById('uploaded_file') as HTMLInputElement;
    const videoFileList = videofile.files as FileList;
    const fileData = videoFileList[0];

    if (!fileData) {
      alert("Please upload a video file.");
      return;
    }

    if (!fileData.type.startsWith('video/')) {
      alert("Uploaded file is not a valid video file.");
      return;
    }

    if (fileData.size > 12582912) {
      alert("Uploaded file is too large. Please upload a file smaller than 12MB.");
      return;
    }
  
    const formData = new FormData();
    formData.append('video', fileData);

    try {
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        alert('Video uploaded successfully!');
      } else {
        alert('Failed to upload video.');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
    } finally {
      setLoading(false);
    }
  }

  const onGetUploadedVideos = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading('fetchUploadsLoading');
    try {
      const params = { name: fileName };
      const queryParams = new URLSearchParams(params).toString();
      const response = await fetch(`http://localhost:8000/api/getUploads?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLinks(data.urls);
        console.log(data);
      } else {
        alert('Failed to get uploaded videos.');
      }
    } catch (error) {
      console.error('Error getting uploaded videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <div className = {classes.app}>
      <h1>Video Transcoder</h1>
      <form className = {classes.form}>
        <input type="file" id='uploaded_file' onChange={handleFileUploadChange}/>
        <button onClick={(e) => onSubmitClick(e)} disabled={loading === 'uploadLoading'}>Upload</button>
        {loading === 'uploadLoading' ? <span>Loading...</span> : null}
      </form>
      <div className={classes.getSection}>
        <h1>Get Uploaded Videos</h1>
        <button onClick={(e) => onGetUploadedVideos(e)} disabled={loading === 'fetchUploadsLoading'}>Get Videos</button>
        {loading === 'fetchUploadsLoading' ? <span>Fetching videos...</span> : null}
        <div style={{marginTop: '1.5em'}}>
          {links.map((linkData, index: number) => (
            <div key={index} style={{marginTop: '0.5em'}}>
              <span>Click on the link to download {linkData.format} format: </span>
              <a key={index} href={linkData.url}>
                {linkData.format}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
