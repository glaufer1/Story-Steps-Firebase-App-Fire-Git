import React from 'react';
import { ContentBlock, BlockType, LocationBlock, LinkButtonBlock, TextBlock, MediaBlock, HowToGetFromBlock, SocialMediaBlock, OpeningTimesBlock, ImageSliderBlock } from '../../interfaces';
import TextForm from './TextForm';
import MediaForm from './MediaForm';
import LocationForm from './LocationForm';
import HowToGetFromForm from './HowToGetFromForm';
import LinkButtonForm from './LinkButtonForm';
import SocialMediaForm from './SocialMediaForm';
import OpeningTimesForm from './OpeningTimesForm';
import ImageSliderForm from './ImageSliderForm';

interface StopPageEditorProps {
  blocks: ContentBlock[];
  onUpdateBlock: (block: ContentBlock) => void;
  onDeleteBlock: (blockId: string) => void;
}

const StopPageEditor: React.FC<StopPageEditorProps> = ({
  blocks,
  onUpdateBlock,
  onDeleteBlock,
}) => {
  const handleUpdateBlock = (updatedBlock: ContentBlock) => {
    onUpdateBlock(updatedBlock);
  };

  const renderBlockEditor = (block: ContentBlock) => {
    switch (block.type) {
      case BlockType.Text:
        return (
          <TextForm
            block={block as TextBlock}
            onUpdate={handleUpdateBlock}
            onDelete={() => onDeleteBlock(block.id)}
          />
        );
      case BlockType.Media:
        return (
          <MediaForm
            block={block as MediaBlock}
            onUpdate={handleUpdateBlock}
            onDelete={() => onDeleteBlock(block.id)}
          />
        );
      case BlockType.Location:
        return (
          <LocationForm
            block={block as LocationBlock}
            onUpdate={handleUpdateBlock}
            onDelete={() => onDeleteBlock(block.id)}
          />
        );
      case BlockType.HowToGetFrom:
        return (
          <HowToGetFromForm
            block={block as HowToGetFromBlock}
            onUpdate={handleUpdateBlock}
            onDelete={() => onDeleteBlock(block.id)}
          />
        );
      case BlockType.LinkButton:
        return (
          <LinkButtonForm
            block={block as LinkButtonBlock}
            onUpdate={handleUpdateBlock}
            onDelete={() => onDeleteBlock(block.id)}
          />
        );
      case BlockType.SocialMedia:
        return (
          <SocialMediaForm
            block={block as SocialMediaBlock}
            onUpdate={handleUpdateBlock}
            onDelete={() => onDeleteBlock(block.id)}
          />
        );
      case BlockType.OpeningTimes:
        return (
          <OpeningTimesForm
            block={block as OpeningTimesBlock}
            onUpdate={handleUpdateBlock}
            onDelete={() => onDeleteBlock(block.id)}
          />
        );
      case BlockType.ImageSlider:
        return (
          <ImageSliderForm
            block={block as ImageSliderBlock}
            onUpdate={handleUpdateBlock}
            onDelete={() => onDeleteBlock(block.id)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="stop-page-editor">
      {blocks.map((block) => (
        <div key={block.id} className="block-editor">
          {renderBlockEditor(block)}
        </div>
      ))}
    </div>
  );
};

export default StopPageEditor;
