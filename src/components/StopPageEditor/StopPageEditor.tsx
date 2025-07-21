import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import type {
  StopPage,
  ContentBlock,
  TextBlock,
  MediaBlock,
  LocationBlock,
  HowToGetFromBlock,
  LinkButtonBlock,
  SocialMediaBlock,
  OpeningTimesBlock,
  ImageSliderBlock,
} from '../../interfaces';
import { BlockType } from '../../interfaces';
import TextForm from './TextForm';
import MediaForm from './MediaForm';
import LocationForm from './LocationForm';
import HowToGetFromForm from './HowToGetFromForm';
import LinkButtonForm from './LinkButtonForm';
import SocialMediaForm from './SocialMediaForm';
import OpeningTimesForm from './OpeningTimesForm';
import ImageSliderForm from './ImageSliderForm';

const StopPageEditor: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [page, setPage] = useState<StopPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pageId) {
      const fetchPage = async () => {
        const pageDoc = await getDoc(doc(db, 'pages', pageId));
        if (pageDoc.exists()) {
          setPage(pageDoc.data() as StopPage);
        }
        setLoading(false);
      };
      fetchPage();
    }
  }, [pageId]);

  const handleUpdateBlock = (updatedBlock: ContentBlock) => {
    if (page) {
      const updatedContentBlocks =
        page.contentBlocks?.map((block) =>
          block.id === updatedBlock.id ? updatedBlock : block
        ) || [];
      const updatedPage = { ...page, contentBlocks: updatedContentBlocks };
      setPage(updatedPage);
      if (pageId) {
        updateDoc(doc(db, 'pages', pageId), updatedPage);
      }
    }
  };

  const addBlock = (type: BlockType) => {
    if (page) {
      const newBlock: ContentBlock = {
        id: `block-${Date.now()}`,
        type,
        order: page.contentBlocks?.length || 0,
      } as ContentBlock;

      const updatedPage = {
        ...page,
        contentBlocks: [...(page.contentBlocks || []), newBlock],
      };
      setPage(updatedPage);
      if (pageId) {
        updateDoc(doc(db, 'pages', pageId), updatedPage);
      }
    }
  };


  if (loading) return <p>Loading...</p>;
  if (!page) return <p>Page not found</p>;

  return (
    <div>
      <h2>Editing Stop Page: {page.title}</h2>
      <div>
        <button onClick={() => addBlock(BlockType.Text)}>Add Text Block</button>
        <button onClick={() => addBlock(BlockType.Media)}>Add Media Block</button>
        {/* Add buttons for other block types */}
      </div>
      {page.contentBlocks?.map((block) => {
        switch (block.type) {
          case BlockType.Text:
            return (
              <TextForm
                key={block.id}
                block={block as TextBlock}
                onUpdate={handleUpdateBlock}
              />
            );
          case BlockType.Media:
            return (
              <MediaForm
                key={block.id}
                block={block as MediaBlock}
                onUpdate={handleUpdateBlock}
              />
            );
          case BlockType.Location:
            return (
              <LocationForm
                key={block.id}
                block={block as LocationBlock}
                onUpdate={handleUpdateBlock}
              />
            );
          case BlockType.HowToGetFrom:
            return (
              <HowToGetFromForm
                key={block.id}
                block={block as HowToGetFromBlock}
                onUpdate={handleUpdateBlock}
              />
            );
          case BlockType.LinkButton:
            return (
              <LinkButtonForm
                key={block.id}
                block={block as LinkButtonBlock}
                onUpdate={handleUpdateBlock}
              />
            );
          case BlockType.SocialMedia:
            return (
              <SocialMediaForm
                key={block.id}
                block={block as SocialMediaBlock}
                onUpdate={handleUpdateBlock}
              />
            );
          case BlockType.OpeningTimes:
            return (
              <OpeningTimesForm
                key={block.id}
                block={block as OpeningTimesBlock}
                onUpdate={handleUpdateBlock}
              />
            );
          case BlockType.ImageSlider:
            return (
              <ImageSliderForm
                key={block.id}
                block={block as ImageSliderBlock}
                onUpdate={handleUpdateBlock}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

export default StopPageEditor;
