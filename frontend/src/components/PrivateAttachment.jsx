import { useState, useEffect } from "react";
import { api } from "../services/client";

export default function PrivateAttachment({ path, className }) {
  const [image, setImage] = useState(""),
    [error, setError] = useState(false);
  useEffect(() => {
    let active = true,
      url;
    setImage("");
    setError(false);
    api
      .get(path, { responseType: "blob" })
      .then(({ data }) => {
        if (active) {
          url = URL.createObjectURL(data);
          setImage(url);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [path]);
  if (error) return <p role="alert">The attachment could not be loaded.</p>;
  if (!image) return <p role="status">Loading attachment…</p>;
  return (
    <a href={image} target="_blank" rel="noreferrer" className={className}>
      <img src={image} alt="Photo attached to grievance" />
      <span>View attached image</span>
    </a>
  );
}
