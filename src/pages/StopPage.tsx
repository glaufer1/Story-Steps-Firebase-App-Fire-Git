import React from 'react';
import type { StopPage as StopPageInterface, ContentBlock, TextBlock, MediaBlock, LinkButtonBlock, LocationBlock, HowToGetFromBlock } from '../interfaces';
import { BlockType } from '../interfaces';
import TextSection from '../components/StopPageBlocks/TextSection';
import MediaSection from '../components/StopPageBlocks/MediaSection';
import LinkButtonSection from '../components/StopPageBlocks/LinkButtonSection';
import LocationSection from '../components/StopPageBlocks/LocationSection';
import HowToGetFromSection from '../components/StopPageBlocks/HowToGetFromSection';

interface StopPageProps {
  page: StopPageInterface;
}

const StopPage: React.FC<StopPageProps> = ({ page }) => {
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
