import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid';

import { StopPage, ContentBlock, BlockType, TextBlock, MediaBlock, LocationBlock, HowToGetFromBlock, LinkButtonBlock, SocialMediaBlock, OpeningTimesBlock, ImageSliderBlock } from '../../interfaces';
import Modal from '../Modal';
import GeoFenceForm from './GeoFenceForm';

// Import all form components
import TextForm from './TextForm';
import MediaForm from './MediaForm';
import LocationForm from './LocationForm';
import HowToGetFromForm from './HowToGetFromForm';
import LinkButtonForm from './LinkButtonForm';
import SocialMediaForm from './SocialMediaForm';
import OpeningTimesForm from './OpeningTimesForm';
import ImageSliderForm from './ImageSliderForm';

interface StopPageEditorProps {
  page: StopPage;
  onSave: (updatedPage: StopPage) => void;
}

const renderBlockForm = (block: ContentBlock, onChange: (updatedBlock: ContentBlock) => void) => {
    switch (block.type) {
        case 'text': return <TextForm block={block as TextBlock} onChange={onChange} />;
        case 'media': return <MediaForm block={block as MediaBlock} onChange={onChange} />;
        case 'location': return <LocationForm block={block as LocationBlock} onChange={onChange} />;
        case 'howToGetFrom': return <HowToGetFromForm block={block as HowToGetFromBlock} onChange={onChange} />;
        case 'links': return <LinkButtonForm block={block as LinkButtonBlock} onChange={onChange} />;
        case 'social': return <SocialMediaForm block={block as SocialMediaBlock} onChange={onChange} />;
        case 'openingTimes': return <OpeningTimesForm block={block as OpeningTimesBlock} onChange={onChange} />;
        case 'imageSlider': return <ImageSliderForm block={block as ImageSliderBlock} onChange={onChange} />;
        default: return <p>Unsupported block type: {block.type}</p>;
    }
};

const StopPageEditor: React.FC<StopPageEditorProps> = ({ page, onSave }) => {
    const [pageDetails, setPageDetails] = useState({
        latitude: page.latitude,
        longitude: page.longitude,
        geoFenceRadius: page.geoFenceRadius
    });
    const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(page.contentBlocks);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = contentBlocks.findIndex((item) => item.id === active.id);
            const newIndex = contentBlocks.findIndex((item) => item.id === over.id);
            const newItems = arrayMove(contentBlocks, oldIndex, newIndex);
            setContentBlocks(newItems.map((item, index) => ({ ...item, order: index })));
        }
    };

    const handleBlockChange = (updatedBlock: ContentBlock) => {
        setContentBlocks(current => current.map(b => b.id === updatedBlock.id ? updatedBlock : b));
    };

    const handleAddNewBlock = (type: BlockType) => {
        const newBlock: any = { id: uuidv4(), type, order: contentBlocks.length };
        switch (type) {
            case 'text': newBlock.content = 'New Text Block'; break;
            case 'media': newBlock.items = []; break;
            case 'location': newBlock.latitude = 0; newBlock.longitude = 0; newBlock.mapType = 'Start Point'; newBlock.address = ''; break;
            case 'howToGetFrom': newBlock.routeData = { type: 'FeatureCollection', features: [] }; newBlock.pins = []; break;
            case 'links': newBlock.title = 'Useful Links'; newBlock.buttons = []; break;
            case 'social': newBlock.links = []; break;
            case 'openingTimes': newBlock.times = []; break;
            case 'imageSlider': newBlock.imageUrl1 = ''; newBlock.imageUrl2 = ''; break;
        }
        setContentBlocks(current => [...current, newBlock]);
        setIsModalOpen(false);
    };

    const handleSave = () => {
        const updatedPage: StopPage = { ...page, ...pageDetails, contentBlocks };
        onSave(updatedPage);
    };

    const availableBlockTypes: BlockType[] = ['text', 'media', 'location', 'howToGetFrom', 'links', 'social', 'imageSlider', 'openingTimes'];

    return (
        <div className="stop-page-editor">
            <h2>Editing: {page.title}</h2>
            <GeoFenceForm latitude={pageDetails.latitude} longitude={pageDetails.longitude} radius={pageDetails.geoFenceRadius}
                onLatitudeChange={(val) => setPageDetails(d => ({ ...d, latitude: val }))}
                onLongitudeChange={(val) => setPageDetails(d => ({ ...d, longitude: val }))}
                onRadiusChange={(val) => setPageDetails(d => ({ ...d, geoFenceRadius: val }))}
            />
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={contentBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                    {contentBlocks.map(block => (
                        <SortableItem key={block.id} id={block.id}>
                            {renderBlockForm(block, handleBlockChange)}
                        </SortableItem>
                    ))}
                </SortableContext>
            </DndContext>
            <div className="editor-actions">
                <button onClick={() => setIsModalOpen(true)}>Add New Block</button>
                <button onClick={handleSave}>Save Changes</button>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h3>Select a Block to Add</h3>
                <div className="block-selection">
                    {availableBlockTypes.map(type => (
                        <button key={type} onClick={() => handleAddNewBlock(type)}>
                            {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')} Block
                        </button>
                    ))}
                </div>
            </Modal>
        </div>
    );
};

const SortableItem: React.FC<{ id: string, children: React.ReactNode }> = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
};

export default StopPageEditor;
