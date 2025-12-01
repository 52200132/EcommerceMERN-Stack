import { useCreateCommentMutation, useGetCommentsByProductQuery } from "#services/comment-services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Alert, Container, Form } from "react-bootstrap";
import { FaReply, FaClock } from "react-icons/fa";
import z from "zod";

import unknownAvatar from "assets/images/cat-avatar.jpg";
import { userModalDialogStore, useShallow, useTpsSelector } from "#custom-hooks";
import { useForm } from "react-hook-form";
import { set } from "lodash";

// Fake data for comments
const fakeComments = [
  {
    id: 1,
    username: "Nguyễn Văn A",
    date: "5 ngày trước",
    content: "Sản phẩm có còn hàng ở chi nhánh Hà Nội không ạ?",
    replies: [
      {
        id: 101,
        username: "Quản Trị Viên",
        isAdmin: true,
        date: "4 ngày trước",
        content: "Chào bạn, hiện tại chi nhánh Hà Nội vẫn còn hàng. Bạn có thể đến trực tiếp để xem sản phẩm hoặc đặt hàng online. Mong sớm nhận được phản hồi từ bạn!"
      }
    ]
  },
  {
    id: 2,
    username: "Trần Thị B",
    date: "1 tuần trước",
    content: "Sản phẩm này có bảo hành chính hãng không ạ?",
    replies: [
      {
        id: 102,
        username: "Quản Trị Viên",
        isAdmin: true,
        date: "6 ngày trước",
        content: "Dạ sản phẩm được bảo hành chính hãng 12 tháng, bạn sẽ nhận được phiếu bảo hành kèm theo sản phẩm khi mua hàng tại cửa hàng hoặc qua website chính thức của chúng tôi."
      }
    ]
  },
  {
    id: 3,
    username: "Lê Văn C",
    date: "2 tuần trước",
    content: "Mình muốn mua trả góp qua thẻ tín dụng thì cần những giấy tờ gì ạ?",
    replies: []
  }
];

const noLoginCommentSchemas = z.object({
  content: z.string().min(1, "Hãy để lại câu hỏi hoặc bình luận").max(500, "Nội dung bình luận không được vượt quá 500 ký tự"),
  user_displayed_name: z.string().min(2, "Tên hiển thị phải có ít nhất 2 ký tự").max(50, "Tên hiển thị không được vượt quá 50 ký tự"),
  phone: z.string().regex(/^[0-9]{10}$/, "Vui lòng nhập số điện thoại hợp lệ gồm 10 chữ số"),
});

const Comments = ({ productId }) => {
  const { isLoggedIn, _id } = useTpsSelector((state) => state.auth.user, { includeProps: ["isLoggedIn", "_id"] });
  const userId = isLoggedIn ? _id : localStorage.getItem("guest_user_id")
  const { data: commentsData, isLoading, isError } = useGetCommentsByProductQuery({
    productId,
    userId: isLoggedIn ? userId : undefined,
    guestId: !isLoggedIn ? userId : undefined,
    page: 1,
    limit: 5
  });
  const [createComment] = useCreateCommentMutation();
  const { register, handleSubmit, unregister, formState: { errors } } = useForm({
    resolver: zodResolver(noLoginCommentSchemas),
    mode: "onBlur"
  });
  useEffect(() => {
    if (isLoggedIn) {
      unregister("user_displayed_name");
      unregister("phone");
    }
  }, [isLoggedIn, unregister]);
  const { setShow, setSize, setBodyComponent } = userModalDialogStore(
    useShallow((zs) => ({
      setShow: zs.setShow,
      setSize: zs.setSize,
      setBodyComponent: zs.setBodyComponent,
    }))
  );
  const [commentsOfMe, setCommentsOfMe] = useState(commentsData?.dt?.comments_of_me || []);
  const [commentsOfProduct, setCommentsOfProduct] = useState([...commentsOfMe, ...(commentsData?.dt?.comments_of_product || [])]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const hasComment = commentsOfProduct?.length > 0;

  const handleReplyClick = (commentId) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
    setReplyContent("");
  };

  const handleReplySubmit = (e, commentId) => {
    e.preventDefault();
    if (replyContent.trim() === "") return;

    const updatedComments = commentsOfProduct.map(comment => {
      if (comment.id === commentId) {
        const reply = {
          id: Date.now(),
          username: "Khách hàng",
          date: "Vừa xong",
          content: replyContent,
          isAdmin: false
        };
        return {
          ...comment,
          replies: [...comment.replies, reply]
        };
      }
      return comment;
    });

    // setComments(updatedComments);
    setReplyContent("");
    setReplyingTo(null);
  };

  const toggleReplyVisibility = (commentId) => {
    const updatedComments = commentsOfProduct.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          showReplies: !comment.showReplies
        };
      }
      return comment;
    });
    // setComments(updatedComments);
  };

  const handleCommentSubmit = handleSubmit((fromValues) => {
    createComment({
      productId: productId,
      content: fromValues.content,
      parentCommentId: null,
      guestId: userId
    }).unwrap()
      .then((data) => {
        setCommentsOfMe([data.dt, ...commentsOfMe]);
        setCommentsOfProduct([data.dt, ...commentsOfMe, ...commentsOfProduct]);
      })
      .catch((error) => {
        console.error("Failed to create comment:", error);
      });

  });

  const handleSendComment = () => {
    if (!isLoggedIn) {
      console.log("Show no login comment form");
      setSize("sm");
      setBodyComponent(<NologinCommentForm onSubmit={handleCommentSubmit} register={register} errors={errors} />);
      setShow(true);
      return;
    }
    // handleCommentSubmit();
  }

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
            placeholder="Viết câu hỏi của bạn tại đây hoặc bình luận..."
            {...register("content")}
          />
          <button onClick={handleSendComment}>Gửi câu hỏi</button>
        </div>
        <Alert variant="warning" show={!!errors.content}>
          {errors.content && errors.content.message}
        </Alert>

        {hasComment ? (
          <div className="tps-comments-list">
            {commentsOfProduct.map((comment) => (
              <div key={comment._id} className="tps-comment-item">
                <div className="tps-comment-avatar">
                  <img src={comment.user_id?.image || unknownAvatar} alt="User Avatar" />
                </div>
                <div className="tps-comment-content">
                  <div className="tps-comment-header">
                    <div className="tps-comment-username">{comment.user_displayed_name}</div>
                    <div className="tps-comment-date">
                      <FaClock /> {comment.create_at}
                    </div>
                  </div>
                  <p>{comment.content}</p>
                  <div className="tps-comment-actions">
                    <button onClick={() => handleReplyClick(comment._id)} className="tps-reply-btn">
                      <FaReply /> Phản hồi
                    </button>
                    {comment.replies.length > 0 && (
                      <button onClick={() => toggleReplyVisibility(comment.id)} className="tps-toggle-replies">
                        {comment.showReplies ? "Thu gọn phản hồi" : `Xem ${comment.replies.length} phản hồi`}
                      </button>
                    )}
                  </div>

                  {replyingTo === comment._id && (
                    <form className="tps-reply-form" onSubmit={(e) => handleReplySubmit(e, comment._id)}>
                      <input
                        type="text"
                        placeholder="Viết phản hồi của bạn"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                      />
                      <button type="submit">Gửi</button>
                    </form>
                  )}

                  {(!comment.hasOwnProperty("showReplies") || comment.showReplies) && comment.replies.length > 0 && (
                    <div className="tps-comment-replies">
                      {comment.replies.map((reply) => (
                        <div key={reply._id} className="tps-reply-item">
                          <div className={`tps-reply-avatar ${reply.user_id?.isManager ? "tps-admin" : ""}`}>
                            {reply.user_id?.isManager ? (
                              <img src="/assets/images/admin-avatar.png" alt="Admin" />
                            ) : (
                              <img src={reply.user_id?.image || unknownAvatar} alt="User Avatar" />
                            )}
                          </div>
                          <div className="tps-reply-content">
                            <div className="tps-reply-header">
                              <h4>{reply.user_displayed_name} {reply.user_id?.isManager && <span className="tps-admin-badge">QTV</span>}</h4>
                              <div className="tps-reply-date">
                                <FaClock /> {reply.create_at}
                              </div>
                            </div>
                            <p>{reply.content}</p>
                            <div className="tps-reply-actions">
                              <button onClick={() => handleReplyClick(comment._id)} className="tps-reply-btn">
                                <FaReply /> Phản hồi
                              </button>
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
          <div>Chưa có comment nào</div>
        )}
      </Container>
    </div>
  );
};

const NologinCommentForm = ({ onSubmit, register, errors }) => {

  return (
    <Form onSubmit={onSubmit}>
      <Form.Group>
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
  )
}

export default Comments;
