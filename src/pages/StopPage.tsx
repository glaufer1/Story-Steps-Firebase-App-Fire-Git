import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { StopPage as StopPageInterface, ContentBlock, TextBlock, MediaBlock, LinkButtonBlock, LocationBlock, HowToGetFromBlock } from '../interfaces';
import { BlockType } from '../interfaces';
import TextSection from '../components/StopPageBlocks/TextSection';
import MediaSection from '../components/StopPageBlocks/MediaSection';
import LinkButtonSection from '../components/StopPageBlocks/LinkButtonSection';
import LocationSection from '../components/StopPageBlocks/LocationSection';
import HowToGetFromSection from '../components/StopPageBlocks/HowToGetFromSection';

const StopPage: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [page, setPage] = useState<StopPageInterface | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      if (!pageId) return;

      try {
        const pageDoc = await getDoc(doc(db, 'pages', pageId));
        if (pageDoc.exists()) {
          setPage(pageDoc.data() as StopPageInterface);
        }
      } catch (err) {
        console.error('Error fetching page:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [pageId]);

  const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
      case BlockType.Text:
        return <TextSection block={block as TextBlock} />;
      case BlockType.Media:
        return <MediaSection block={block as MediaBlock} />;
      case BlockType.LinkButton:
        return <LinkButtonSection block={block as LinkButtonBlock} />;
      case BlockType.Location:
        return <LocationSection block={block as LocationBlock} />;
      case BlockType.HowToGetFrom:
        return <HowToGetFromSection block={block as HowToGetFromBlock} />;
      default:
        return null;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!page) return <div>Page not found</div>;

  return (
    <div>
      <h1>{page.title}</h1>
      {page.heroImageUrl && <img src={page.heroImageUrl} alt={page.title} />}
      {page.audioFileUrl && <audio src={page.audioFileUrl} controls />}
      <div>
        {page.contentBlocks?.sort((a, b) => a.order - b.order).map(renderBlock)}
      </div>
    </div>
  );
};

export default StopPage;
