import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import { useTpsSelector } from "custom-hooks/use-tps-selector";
import { MdOutlineChangeCircle, MdOutlineDomainVerification } from "react-icons/md";
import { IoTrashBinSharp } from "react-icons/io5";
import { FaRegStar } from "react-icons/fa";
import { closestCenter, DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { nanoid } from "@reduxjs/toolkit";
import _ from 'lodash'

import ImageUploading from "react-images-uploading";

/**
 * @param {object} props -
 * @param {function} [props.selector] - 
 * @param {function} [props.action] - 
 * @param {function} [props.uploadsApi] - 
 * @param {boolean} [props.uploadToServer=false] - có upload ảnh lên server không, mặc định là flase
 * @param {string} [props.upload_action_name] - tên đã được đăng ký bằng dispatch(createTriggerAction(triggerKeyName)) mặc định là 'upload_action'
 * @returns 
 */
const MultiImageUpload = (props) => {
  const { selector, action, uploadsApi, uploadToServer = false, upload_action_name = 'upload_action' } = props
  const dispatch = useDispatch();
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
  const { upload_action } = useTpsSelector((state) => state.component, { includeProps: [upload_action_name] })
  const refSelector = useSelector(selector);
  const images = _.isEqual(refSelector, [{ url: '', is_primary: false }]) ? [] : refSelector;
  const [isPrimaryIndex, setIsPrimaryIndex] = useState(0);
  const [activeId, setActiveId] = useState(null);
  const uniqueId = useMemo(() => nanoid(), []);
  let imageFiles = []
  const maxNumber = 10;

  useEffect(() => {
    if (upload_action && uploadToServer && uploadsApi) {
      // TODO: xử lý upload ảnh lên server
      // console.log('UPLOAD: images id:', generatePrimaryKey);
    }
  }, [upload_action, uploadToServer, uploadsApi])

  const onChange = (imageList) => {
    imageFiles = imageList
    setIsPrimaryIndex(prev => {
      if (imageList.length === 0) return 0;
      if (prev >= imageList.length) return imageList.length - 1;
      return prev;
    });
    const newImages = imageList.map((img, index) => { return { is_primary: index === isPrimaryIndex, url: img.url } });
    dispatch(action(newImages));
  };

  const handleChangePrimary = (newIndex) => {
    setIsPrimaryIndex(newIndex);
    const newImages = images.map((img, index) => { return { is_primary: index === newIndex, url: img.url } });
    dispatch(action(newImages));
  }

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeIndex = parseInt(active.id.split('-')[1], 10);
    const overIndex = parseInt(over.id.split('-')[1], 10);
    console.log('DRAG END: ', activeIndex, overIndex);
    const newImages = arrayMove(images, activeIndex, overIndex);
    imageFiles = newImages;
    dispatch(action(newImages));
  };
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
  }
  const handleDragCancel = () => {
    setActiveId(null);
  }

  console.log('RENDER: multi-img-upload');
  return (
    <>
      <ImageUploading
        multiple
        value={images}
        onChange={onChange}
        maxNumber={maxNumber}
        dataURLKey="url"
      >
        {({
          imageList,
          onImageUpload,
          onImageRemove,
          onImageUpdate,
          dragProps,
        }) => (
          <div className="tps-multi-image-upload">
            <Button className="upload-button" onClick={onImageUpload} {...dragProps}>
              📷 Chọn hoặc kéo ảnh vào đây (Tối đa {maxNumber} ảnh)
            </Button>
            <DndContext collisionDetection={closestCenter} sensors={sensors} 
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
              onDragCancel={handleDragCancel}
            >
              <SortableContext
                items={imageList.map((_, i) => (`${uniqueId}-${i}`).toString())}
                strategy={rectSortingStrategy}
              >
                <div className="images-grid">
                  {imageList.map((image, index) => (
                    <SortableImageItem
                      key={`${uniqueId}-${index}`}
                      id={`${uniqueId}-${index}`}
                      image={image}
                      index={index}
                      isPrimaryIndex={isPrimaryIndex}
                      onImageRemove={onImageRemove}
                      onImageUpdate={onImageUpdate}
                      handleChangePrimary={handleChangePrimary}
                    />
                  ))}
                </div>
              </SortableContext>
              {/* <DragOverlay adjustScale style={{ transformOrigin: '0 0 ' }}>
                {activeId ? <Item id={activeId} isDragging /> : null}
            </DragOverlay> */}
            </DndContext>

          </div>
        )}
      </ImageUploading>
    </>
  );
}

const SortableImageItem = ({
  id,
  image,
  index,
  isPrimaryIndex,
  onImageRemove,
  onImageUpdate,
  handleChangePrimary,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    cursor: "grab",
    // zIndex: activeId === id ? 1000 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="image-item">
      <div className="image-controls-left">
        <Button
          className={`btn-primary-toggle ${isPrimaryIndex === index ? "is-primary" : ""}`}
          onClick={() => handleChangePrimary(index)}
          title={isPrimaryIndex === index ? "Ảnh chính" : "Đặt làm ảnh chính"}
          disabled={isPrimaryIndex === index}
        >
          {isPrimaryIndex === index ? (
            <MdOutlineDomainVerification size={20} />
          ) : (
            <FaRegStar size={18} />
          )}
        </Button>

        <Button className="btn-update" onClick={() => onImageUpdate(index)} title="Thay đổi">
          <MdOutlineChangeCircle size={20} />
        </Button>

        <Button className="btn-remove" onClick={() => onImageRemove(index)} title="Xóa">
          <IoTrashBinSharp size={18} />
        </Button>
      </div>

      <div className="image-wrapper"  {...listeners} >
        <img src={image.url} alt={`Product ${index + 1}`} />
      </div>
    </div>
  );
}

// const Item = (({ id, withOpacity, isDragging, style, ...props }, ref) => {
//     const inlineStyles = {
//         opacity: withOpacity ? '0.5' : '1',
//         transformOrigin: '50% 50%',
//         // height: '140px',
//         // width: '140px',
//         // borderRadius: '10px',
//         cursor: isDragging ? 'grabbing' : 'grab',
//         backgroundColor: '#ffffff',
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         boxShadow: isDragging  ? 'rgb(63 63 68 / 5%) 0px 2px 0px 2px, rgb(34 33 81 / 15%) 0px 2px 3px 2px' : 'rgb(63 63 68 / 5%) 0px 0px 0px 1px, rgb(34 33 81 / 15%) 0px 1px 3px 0px',
//         transform: isDragging ? 'scale(1.05)' : 'scale(1)',
//         ...style,
//     };

//     return <div ref={ref} style={inlineStyles} {...props}>{id}</div>;
// });

export default MultiImageUpload;