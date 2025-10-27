import { useDispatch, useSelector } from "react-redux";
import _ from 'lodash'
import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { nanoid } from "@reduxjs/toolkit";

import ImageUploading from "react-images-uploading";
import { useTpsSelector } from "custom-hooks/use-tps-selector";

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

  const { upload_action } = useTpsSelector((state) => state.component, { includeProps: [upload_action_name] })
  const refSelector = useSelector(selector);
  const images = _.isEqual(refSelector, [{ url: '', is_primary: false }]) ? [] : refSelector;
  const [isPrimaryIndex, setIsPrimaryIndex] = useState(0);
  let imageFiles = []
  const maxNumber = 10;
  const generatePrimaryKey = nanoid();

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
    // console.log('>>> check newImages: ', images);
  };
  const handleChangePrimary = (newIndex) => {
    setIsPrimaryIndex(newIndex);
    const newImages = images.map((img, index) => { return { is_primary: index === newIndex, url: img.url } });
    dispatch(action(newImages));
    // console.log('>>> check newImages: ', newImages);
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
          <div>
            <button onClick={onImageUpload} {...dragProps}>
              Chọn hoặc kéo ảnh vào đây
            </button>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
              {imageList.map((image, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <img
                    src={image.url}
                    alt=""
                    width="120"
                    style={{ borderRadius: 8, objectFit: "cover" }}
                  />
                  <div style={{ marginTop: 5, textAlign: "center" }}>
                    <button onClick={() => onImageUpdate(index)}>Thay</button>
                    <button onClick={() => onImageRemove(index)}>Xóa</button>
                    <Form.Check
                      type="radio"
                      name={`tps-${generatePrimaryKey}`}
                      checked={isPrimaryIndex === index}
                      onChange={() => handleChangePrimary(index)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ImageUploading>
    </>
  );
}

export default MultiImageUpload;