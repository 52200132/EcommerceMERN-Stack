import { useCreateCommentMutation, useDeleteCommentMutation, useGetCommentsByProductQuery, useUpdateCommentMutation } from "#services/comment-services";
import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Container, Form, Spinner } from "react-bootstrap";
import { FaClock, FaEdit, FaReply, FaTrash } from "react-icons/fa";
import unknownAvatar from "assets/images/cat-avatar.jpg";
import { userModalDialogStore, useShallow, useTpsSelector } from "#custom-hooks";
import { useForm } from "react-hook-form";

const GUEST_ID_KEY = "guest_user_id";
const GUEST_PROFILE_KEY = "guest_comment_profile";
const phoneRegex = /^[0-9]{10}$/;

const generateGuestId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

const normalizeComment = (comment) => {
  if (!comment) return comment;
  const replies = Array.isArray(comment.replies)
    ? comment.replies
    : comment.replies
      ? [comment.replies]
      : [];
  return { ...comment, replies };
};

const formatDateTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const Comments = ({ productId }) => {
  const { isLoggedIn, _id, isManager } = useTpsSelector((state) => state.auth.user || {}, {
    includeProps: ["isLoggedIn", "_id", "isManager"],
  });
  const [guestId] = useState(() => localStorage.getItem(GUEST_ID_KEY) || generateGuestId());
  const [guestProfile, setGuestProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(GUEST_PROFILE_KEY)) || {};
    } catch (error) {
      return {};
    }
  });

  useEffect(() => {
    if (!localStorage.getItem(GUEST_ID_KEY)) {
      localStorage.setItem(GUEST_ID_KEY, guestId);
    }
  }, [guestId]);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      content: "",
      user_displayed_name: guestProfile?.user_displayed_name || "",
      phone: guestProfile?.phone || "",
    },
  });

  const [comments, setComments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyErrors, setReplyErrors] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [openReplies, setOpenReplies] = useState({});
  const [pendingAction, setPendingAction] = useState(null);
  const [globalError, setGlobalError] = useState("");
  const [activeLoadingId, setActiveLoadingId] = useState(null);

  const queryArgs = useMemo(() => {
    if (!productId) return null;
    return {
      productId,
      userId: isLoggedIn ? _id : undefined,
      guestId: !isLoggedIn ? guestId : undefined,
      page: 1,
      limit: 20,
    };
  }, [productId, isLoggedIn, _id, guestId]);

  const { data: commentsData, isFetching, isError } = useGetCommentsByProductQuery(queryArgs, { skip: !queryArgs });
  const [createComment] = useCreateCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  useEffect(() => {
    if (!commentsData?.dt) return;
    const { comments_of_me = [], comments_of_product = [] } = commentsData.dt;
    const merged = [...comments_of_me, ...comments_of_product].map(normalizeComment);
    setComments(merged);
  }, [commentsData]);

  useEffect(() => {
    setValue("user_displayed_name", guestProfile?.user_displayed_name || "");
    setValue("phone", guestProfile?.phone || "");
  }, [guestProfile, setValue]);

  const { setShow, setSize, setBodyComponent, setButtons, setTitle, reset: resetModal } = userModalDialogStore(
    useShallow((zs) => ({
      setShow: zs.setShow,
      setSize: zs.setSize,
      setBodyComponent: zs.setBodyComponent,
      setButtons: zs.setButtons,
      setTitle: zs.setTitle,
      reset: zs.reset,
    }))
  );

  const isOwner = (comment) => {
    if (!comment) return false;
    if (isManager) return true;
    if (isLoggedIn) {
      const cUserId = typeof comment.user_id === "object" ? comment.user_id?._id : comment.user_id;
      return cUserId?.toString() === _id?.toString();
    }
    return guestId && comment.guest_id === guestId;
  };

  const guestProfileReady = (values) => {
    const name = (values?.user_displayed_name || guestProfile?.user_displayed_name || "").trim();
    const phone = (values?.phone || guestProfile?.phone || "").trim();
    return name.length >= 2 && phoneRegex.test(phone);
  };

  const persistGuestProfile = (values) => {
    const profile = {
      user_displayed_name: values.user_displayed_name.trim(),
      phone: values.phone.trim(),
    };
    setGuestProfile(profile);
    localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
  };

  const handleGuestInfoConfirm = (values) => {
    const name = values.user_displayed_name?.trim();
    const phone = values.phone?.trim();
    if (!name || name.length < 2) {
      setError("user_displayed_name", { type: "manual", message: "Tên hiển thị phải có ít nhất 2 ký tự" });
      return;
    }
    if (!phone || !phoneRegex.test(phone)) {
      setError("phone", { type: "manual", message: "Vui lòng nhập số điện thoại hợp lệ gồm 10 chữ số" });
      return;
    }
    persistGuestProfile(values);
    setShow(false);

    if (pendingAction?.type === "root") {
      createNewComment(pendingAction.content, null, values);
    }
    if (pendingAction?.type === "reply") {
      createNewComment(pendingAction.content, pendingAction.commentId, values, true);
    }
    setPendingAction(null);
  };

  const openGuestModal = () => {
    setTitle("Bổ sung thông tin liên hệ");
    setSize("sm");
    setBodyComponent(<NologinCommentForm register={register} errors={errors} />);
    setButtons([
      <Button key="confirm-guest" variant="primary" onClick={handleSubmit(handleGuestInfoConfirm)}>
        Xác nhận & gửi
      </Button>
    ]);
    setShow(true);
  };

  const createNewComment = async (content, parentCommentId = null, values = {}, clearReplyDraft = false) => {
    setGlobalError("");
    const trimmed = content?.trim();
    if (!trimmed) return;
    const displayName = isLoggedIn ? undefined : (values.user_displayed_name?.trim() || guestProfile?.user_displayed_name);

    setActiveLoadingId(parentCommentId ? `reply-${parentCommentId}` : "root");
    try {
      const res = await createComment({
        productId,
        content: trimmed,
        parentCommentId,
        displayName,
        guestId: isLoggedIn ? undefined : guestId,
      }).unwrap();
      const newComment = normalizeComment(res?.dt);
      if (parentCommentId) {
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === parentCommentId
              ? { ...comment, replies: [newComment, ...(comment.replies || [])] }
              : comment
          )
        );
        if (clearReplyDraft) {
          setReplyDrafts((prev) => ({ ...prev, [parentCommentId]: "" }));
        }
        setReplyingTo(null);
      } else {
        setComments((prev) => [newComment, ...prev]);
        setValue("content", "");
      }
    } catch (error) {
      setGlobalError(error?.em || "Không thể gửi bình luận, vui lòng thử lại");
    } finally {
      setActiveLoadingId(null);
      resetModal();
    }
  };

  const handleSendComment = () => {
    clearErrors();
    handleSubmit((values) => {
      const content = values.content?.trim();
      if (!content) {
        setError("content", { type: "manual", message: "Hãy để lại câu hỏi hoặc bình luận" });
        return;
      }
      if (!isLoggedIn && !guestProfileReady(values)) {
        setPendingAction({ type: "root", content });
        openGuestModal();
        return;
      }
      createNewComment(content, null, values);
    })();
  };

  const handleReplyClick = (commentId) => {
    setReplyingTo((prev) => prev === commentId ? null : commentId);
    setReplyErrors((prev) => ({ ...prev, [commentId]: "" }));
  };

  const toggleReplyVisibility = (commentId) => {
    setOpenReplies((prev) => ({ ...prev, [commentId]: prev[commentId] === false ? true : false }));
  };

  const handleReplyChange = (commentId, value) => {
    setReplyDrafts((prev) => ({ ...prev, [commentId]: value }));
  };

  const handleReplySubmit = (commentId) => {
    const content = (replyDrafts[commentId] || "").trim();
    if (!content) {
      setReplyErrors((prev) => ({ ...prev, [commentId]: "Vui lòng nhập nội dung phản hồi" }));
      return;
    }
    if (!isLoggedIn && !guestProfileReady()) {
      setPendingAction({ type: "reply", commentId, content });
      openGuestModal();
      return;
    }
    createNewComment(content, commentId, guestProfile, true);
  };

  const handleStartEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditingContent(comment.content);
  };

  const handleUpdateComment = async () => {
    if (!editingContent.trim()) {
      setGlobalError("Nội dung bình luận không được để trống");
      return;
    }
    setActiveLoadingId(`edit-${editingCommentId}`);
    try {
      const res = await updateComment({
        commentId: editingCommentId,
        content: editingContent.trim(),
        guestId: isLoggedIn ? undefined : guestId,
      }).unwrap();
      const updated = normalizeComment(res?.dt);
      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === editingCommentId) {
            return { ...comment, ...updated };
          }
          if (comment.replies?.some((reply) => reply._id === editingCommentId)) {
            return {
              ...comment,
              replies: comment.replies.map((reply) => reply._id === editingCommentId ? { ...reply, ...updated } : reply),
            };
          }
          return comment;
        })
      );
      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      setGlobalError(error?.em || "Không thể cập nhật bình luận");
    } finally {
      setActiveLoadingId(null);
    }
  };

  const handleDeleteComment = async (commentId, parentId = null) => {
    const confirmMsg = parentId ? "Bạn có chắc muốn xóa phản hồi này?" : "Bạn có chắc muốn xóa bình luận này?";
    if (!window.confirm(confirmMsg)) return;
    setActiveLoadingId(`del-${commentId}`);
    try {
      await deleteComment({ commentId, guestId: isLoggedIn ? undefined : guestId }).unwrap();
      if (parentId) {
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === parentId
              ? { ...comment, replies: (comment.replies || []).filter((reply) => reply._id !== commentId) }
              : comment
          )
        );
      } else {
        setComments((prev) => prev.filter((comment) => comment._id !== commentId));
      }
    } catch (error) {
      setGlobalError(error?.em || "Không thể xóa bình luận");
    } finally {
      setActiveLoadingId(null);
    }
  };

  const hasComment = comments.length > 0;

  return (
    <div className="tps-comments-section">
      <Container>
        <div className="tps-comments-header">
          <div className="tps-comments-icon">
            <img src="/assets/images/comment-icon.png" alt="Comment Icon" />
          </div>
          <div className="tps-comments-title">
            <h3>Hỏi và đáp</h3>
            <p>Hãy đặt câu hỏi cho chúng tôi</p>
            <small>2TPS-Shop sẽ phản hồi trong vòng 1 giờ. Nếu Quý khách gửi câu hỏi sau 22h, chúng tôi sẽ trả lời vào sáng hôm sau. Thông tin có thể thay đổi theo thời gian, vui lòng đặt câu hỏi để nhận được cập nhật mới nhất!</small>
          </div>
        </div>

        <div className="tps-comment-form">
          <input
            type="text"
            placeholder={isLoggedIn ? "Viết câu hỏi của bạn tại đây hoặc bình luận..." : "Nhập nội dung bình luận, chúng tôi sẽ phản hồi sớm nhất"}
            {...register("content")}
          />
          <button onClick={handleSendComment} disabled={activeLoadingId === "root"}>
            {activeLoadingId === "root" ? <Spinner animation="border" size="sm" /> : "Gửi câu hỏi"}
          </button>
        </div>
        <Alert variant="warning" show={!!errors.content}>
          {errors.content && errors.content.message}
        </Alert>
        {!isLoggedIn && guestProfile?.user_displayed_name && (
          <div className="text-muted mb-2">
            Bình luận với tên: <strong>{guestProfile.user_displayed_name}</strong> | SĐT: {guestProfile.phone}
          </div>
        )}
        {globalError && (
          <Alert variant="danger" className="mt-2">
            {globalError}
          </Alert>
        )}
        {isFetching && !hasComment && <div>Đang tải bình luận...</div>}
        {isError && <div>Không thể tải bình luận, vui lòng thử lại.</div>}

        {hasComment ? (
          <div className="tps-comments-list">
            {comments.map((comment) => (
              <div key={comment._id} className="tps-comment-item">
                <div className="tps-comment-avatar">
                  <img src={comment.user_id?.image || unknownAvatar} alt="User Avatar" />
                </div>
                <div className="tps-comment-content">
                  <div className="tps-comment-header">
                    <div className="tps-comment-username">
                      {comment.user_displayed_name} {comment.user_id?.isManager && <span className="tps-admin-badge ms-1">QTV</span>}
                    </div>
                    <div className="tps-comment-date">
                      <FaClock /> {formatDateTime(comment.created_at)}
                    </div>
                  </div>
                  {editingCommentId === comment._id ? (
                    <div className="mb-2">
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                      />
                      <div className="mt-2 d-flex gap-2">
                        <Button size="sm" variant="primary" onClick={handleUpdateComment} disabled={activeLoadingId === `edit-${comment._id}`}>
                          {activeLoadingId === `edit-${comment._id}` ? <Spinner animation="border" size="sm" /> : "Lưu"}
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => { setEditingCommentId(null); setEditingContent(""); }}>
                          Hủy
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p>{comment.content}</p>
                  )}
                  <div className="tps-comment-actions">
                    <button onClick={() => handleReplyClick(comment._id)} className="tps-reply-btn">
                      <FaReply /> Phản hồi
                    </button>
                    {isOwner(comment) && (
                      <>
                        <button onClick={() => handleStartEdit(comment)} className="tps-reply-btn">
                          <FaEdit /> Sửa
                        </button>
                        <button onClick={() => handleDeleteComment(comment._id)} className="tps-reply-btn">
                          <FaTrash /> Xóa
                        </button>
                      </>
                    )}
                    {comment.replies.length > 0 && (
                      <button onClick={() => toggleReplyVisibility(comment._id)} className="tps-toggle-replies">
                        {openReplies[comment._id] === false ? `Xem ${comment.replies.length} phản hồi` : "Thu gọn phản hồi"}
                      </button>
                    )}
                  </div>

                  {replyingTo === comment._id && (
                    <form className="tps-reply-form" onSubmit={(e) => { e.preventDefault(); handleReplySubmit(comment._id); }}>
                      <input
                        type="text"
                        placeholder="Viết phản hồi của bạn"
                        value={replyDrafts[comment._id] || ""}
                        onChange={(e) => handleReplyChange(comment._id, e.target.value)}
                      />
                      <button type="submit" disabled={activeLoadingId === `reply-${comment._id}`}>
                        {activeLoadingId === `reply-${comment._id}` ? <Spinner animation="border" size="sm" /> : "Gửi"}
                      </button>
                    </form>
                  )}
                  {replyErrors[comment._id] && (
                    <Alert variant="warning" className="mt-2 mb-0">
                      {replyErrors[comment._id]}
                    </Alert>
                  )}

                  {openReplies[comment._id] !== false && comment.replies.length > 0 && (
                    <div className="tps-comment-replies">
                      {comment.replies.map((reply) => (
                        <div key={reply._id} className="tps-reply-item">
                          <div className={`tps-reply-avatar ${reply.user_id?.isManager ? "tps-admin" : ""}`}>
                            {reply.user_id?.isManager ? (
                              <img src={reply.user_id?.image || unknownAvatar} alt="Admin Avatar" />
                            ) : (
                              <img src={reply.user_id?.image || unknownAvatar} alt="User Avatar" />
                            )}
                          </div>
                          <div className="tps-reply-content">
                            <div className="tps-reply-header">
                              <h4>
                                {reply.user_displayed_name} {reply.user_id?.isManager && <span className="tps-admin-badge">QTV</span>}
                              </h4>
                              <div className="tps-reply-date">
                                <FaClock /> {formatDateTime(reply.created_at)}
                              </div>
                            </div>
                            {editingCommentId === reply._id ? (
                              <div className="mb-2">
                                <Form.Control
                                  as="textarea"
                                  rows={3}
                                  value={editingContent}
                                  onChange={(e) => setEditingContent(e.target.value)}
                                />
                                <div className="mt-2 d-flex gap-2">
                                  <Button size="sm" variant="primary" onClick={handleUpdateComment} disabled={activeLoadingId === `edit-${reply._id}`}>
                                    {activeLoadingId === `edit-${reply._id}` ? <Spinner animation="border" size="sm" /> : "Lưu"}
                                  </Button>
                                  <Button size="sm" variant="secondary" onClick={() => { setEditingCommentId(null); setEditingContent(""); }}>
                                    Hủy
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p>{reply.content}</p>
                            )}
                            <div className="tps-reply-actions">
                              <button onClick={() => handleReplyClick(comment._id)} className="tps-reply-btn">
                                <FaReply /> Phản hồi
                              </button>
                              {isOwner(reply) && (
                                <>
                                  <button onClick={() => handleStartEdit(reply)} className="tps-reply-btn">
                                    <FaEdit /> Sửa
                                  </button>
                                  <button onClick={() => handleDeleteComment(reply._id, comment._id)} className="tps-reply-btn">
                                    <FaTrash /> Xóa
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>Chưa có bình luận nào. Hãy là người đầu tiên để lại câu hỏi!</div>
        )}
      </Container>
    </div>
  );
};

const NologinCommentForm = ({ register, errors }) => {
  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="user_displayed_name">Tên hiển thị</Form.Label>
        <Form.Control
          id="user_displayed_name"
          type="text"
          placeholder="Nhập tên hiển thị"
          {...register("user_displayed_name")}
          isInvalid={!!errors.user_displayed_name}
        />
        <Form.Control.Feedback type="invalid">
          {errors.user_displayed_name && errors.user_displayed_name.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label htmlFor="phone">Số điện thoại</Form.Label>
        <Form.Control
          id="phone"
          type="text"
          placeholder="Nhập số điện thoại"
          {...register("phone")}
          isInvalid={!!errors.phone}
        />
        <Form.Control.Feedback type="invalid">
          {errors.phone && errors.phone.message}
        </Form.Control.Feedback>
      </Form.Group>
    </Form>
  );
};

export default Comments;
