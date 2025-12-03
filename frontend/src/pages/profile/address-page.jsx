import { useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import { OFF_CANVAS_BODY_KEYS, useOffCanvasStore, useShallow } from "#custom-hooks";
import { setAddressList } from "#features/user-profile-slice";
import { useLazyGetAddressesQuery, useUpdateAddressMutation, useDeleteAddressMutation } from "#services/user-services";

const AddressPage = () => {
  const dispatch = useDispatch();
  const { setShowOffCanvas, setOffCanvasBody, setDefaultFormValues } = useOffCanvasStore(
    useShallow((zs) => ({
      setShowOffCanvas: zs.setShow,
      setOffCanvasBody: zs.setActiveOffCanvasBody,
      setDefaultFormValues: zs.setDefaultFormValues,
    }))
  );

  const addresses = useSelector((state) => state.userProfile.address_list);
  const [getAddresses, { isFetching }] = useLazyGetAddressesQuery();
  const [updateAddress, { isLoading: isSettingDefault }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const [deletingAddressId, setDeletingAddressId] = useState(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      const result = await getAddresses();
      if (result?.data?.dt) {
        dispatch(setAddressList(result.data.dt));
      }
    };
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (addresses?.length) {
      const defaultAddr = addresses.find((addr) => addr.isDefault);
      setDefaultAddressId(defaultAddr?._id || addresses[0]?._id || null);
    } else {
      setDefaultAddressId(null);
    }
  }, [addresses]);

  const handleSetDefaultAddress = async (address) => {
    if (!address?._id) return;
    setDefaultAddressId(address._id);
    const result = await updateAddress({ address_id: address._id, isDefault: true });
    if ('error' in result) {
      const fallbackDefault = addresses.find((addr) => addr.isDefault);
      setDefaultAddressId(fallbackDefault?._id || null);
    }
  };

  const openEditor = (data = null) => {
    setDefaultFormValues(data || {});
    setOffCanvasBody(OFF_CANVAS_BODY_KEYS.ADDRESS_FORM);
    setShowOffCanvas(true);
  };

  const handleDeleteAddress = async (address) => {
    if (!address?._id) return;
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?');
    if (!confirmDelete) return;

    setDeletingAddressId(address._id);
    const result = await deleteAddress(address._id);
    setDeletingAddressId(null);

    if (result?.data?.ec === 200) {
      const updatedAddresses = (Array.isArray(addresses) ? addresses : []).filter((addr) => addr._id !== address._id);
      dispatch(setAddressList(updatedAddresses));
    }
  };

  const addressList = useMemo(
    () =>
      (Array.isArray(addresses) ? addresses : []).map((addr) => ({
        ...addr,
        isDefault: defaultAddressId ? addr._id === defaultAddressId : !!addr.isDefault,
      })),
    [addresses, defaultAddressId]
  );

  if (isFetching && !addressList.length) {
    return <div>Đang cập nhật...</div>;
  }

  return (
    <div className="profile-panel">
      <div className="profile-panel__heading">
        <div>
          <h2>Địa chỉ của tôi</h2>
          <p>Quản lý địa chỉ giao hàng để nhận hàng nhanh hơn</p>
        </div>
        <Button variant="primary" onClick={() => openEditor()}>
          + Thêm địa chỉ mới
        </Button>
      </div>
      <div className="profile-address-list">
        {addressList.map((address) => (
          <article key={address._id} className={`address-card ${address.isDefault ? 'is-default' : ''}`}>
            <div className="address-card__header">
              <div>
                <h5>{address.receiver}</h5>
                <p>{address.phone}</p>
              </div>
              {address.isDefault && <span className="address-card__badge">Mặc định</span>}
            </div>
            <p className="address-card__text">{address.street}</p>
            <div className="address-card__meta">
              {[address.ward, address.district, address.province]
                .filter(Boolean)
                .join(', ')}
            </div>
            <div className="address-card__actions">
              <Button variant="outline-primary" size="sm" onClick={() => openEditor(address)}>
                Cập nhật
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleDeleteAddress(address)}
                disabled={isDeleting && deletingAddressId === address._id}
              >
                {isDeleting && deletingAddressId === address._id ? 'Đang xóa...' : 'Xóa'}
              </Button>
              <button
                type="button"
                className="address-card__link"
                onClick={() => handleSetDefaultAddress(address)}
                disabled={address.isDefault || isSettingDefault}
              >
                Thiết lập mặc định
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default AddressPage;
