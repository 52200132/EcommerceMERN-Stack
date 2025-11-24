import { useState } from 'react';
import { FaReply, FaClock } from 'react-icons/fa';

// Fake data for comments
const fakeComments = [
  {
    id: 1,
    username: 'Nguyễn Văn A',
    date: '5 ngày trước',
    content: 'Sản phẩm có còn hàng ở chi nhánh Hà Nội không ạ?',
    replies: [
      {
        id: 101,
        username: 'Quản Trị Viên',
        isAdmin: true,
        date: '4 ngày trước',
        content: 'Chào bạn, hiện tại chi nhánh Hà Nội vẫn còn hàng. Bạn có thể đến trực tiếp để xem sản phẩm hoặc đặt hàng online. Mong sớm nhận được phản hồi từ bạn!'
      }
    ]
  },
  {
    id: 2,
    username: 'Trần Thị B',
    date: '1 tuần trước',
    content: 'Sản phẩm này có bảo hành chính hãng không ạ?',
    replies: [
      {
        id: 102,
        username: 'Quản Trị Viên',
        isAdmin: true,
        date: '6 ngày trước',
        content: 'Dạ sản phẩm được bảo hành chính hãng 12 tháng, bạn sẽ nhận được phiếu bảo hành kèm theo sản phẩm khi mua hàng tại cửa hàng hoặc qua website chính thức của chúng tôi.'
      }
    ]
  },
  {
    id: 3,
    username: 'Lê Văn C',
    date: '2 tuần trước',
    content: 'Mình muốn mua trả góp qua thẻ tín dụng thì cần những giấy tờ gì ạ?',
    replies: []
  }
];

const Comments = () => {
  const [comments, setComments] = useState(fakeComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim() === '') return;

    const comment = {
      id: comments.length + 1,
      username: 'Khách hàng',
      date: 'Vừa xong',
      content: newComment,
      replies: []
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleReplyClick = (commentId) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
    setReplyContent('');
  };

  const handleReplySubmit = (e, commentId) => {
    e.preventDefault();
    if (replyContent.trim() === '') return;

    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        const reply = {
          id: Date.now(),
          username: 'Khách hàng',
          date: 'Vừa xong',
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

    setComments(updatedComments);
    setReplyContent('');
    setReplyingTo(null);
  };

  const toggleReplyVisibility = (commentId) => {
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          showReplies: !comment.showReplies
        };
      }
      return comment;
    });
    setComments(updatedComments);
  };

  return (
    <div className="tps-comments-section">
      <div className="container">
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

        <form className="tps-comment-form" onSubmit={handleCommentSubmit}>
          <input
            type="text"
            placeholder="Viết câu hỏi của bạn tại đây"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button type="submit">Gửi câu hỏi</button>
        </form>

        <div className="tps-comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="tps-comment-item">
              <div className="tps-comment-avatar">
                <span>{comment.username.charAt(0)}</span>
              </div>
              <div className="tps-comment-content">
                <div className="tps-comment-header">
                  <div className="tps-comment-username">{comment.username}</div>
                  <div className="tps-comment-date">
                    <FaClock /> {comment.date}
                  </div>
                </div>
                <p>{comment.content}</p>
                <div className="tps-comment-actions">
                  <button onClick={() => handleReplyClick(comment.id)} className="tps-reply-btn">
                    <FaReply /> Phản hồi
                  </button>
                  {comment.replies.length > 0 && (
                    <button onClick={() => toggleReplyVisibility(comment.id)} className="tps-toggle-replies">
                      {comment.showReplies ? 'Thu gọn phản hồi' : `Xem ${comment.replies.length} phản hồi`}
                    </button>
                  )}
                </div>

                {replyingTo === comment.id && (
                  <form className="tps-reply-form" onSubmit={(e) => handleReplySubmit(e, comment.id)}>
                    <input
                      type="text"
                      placeholder="Viết phản hồi của bạn"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                    />
                    <button type="submit">Gửi</button>
                  </form>
                )}

                {(!comment.hasOwnProperty('showReplies') || comment.showReplies) && comment.replies.length > 0 && (
                  <div className="tps-comment-replies">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="tps-reply-item">
                        <div className={`tps-reply-avatar ${reply.isAdmin ? 'tps-admin' : ''}`}>
                          {reply.isAdmin ? (
                            <img src="/assets/images/admin-avatar.png" alt="Admin" />
                          ) : (
                            <span>{reply.username.charAt(0)}</span>
                          )}
                        </div>
                        <div className="tps-reply-content">
                          <div className="tps-reply-header">
                            <h4>{reply.username} {reply.isAdmin && <span className="tps-admin-badge">QTV</span>}</h4>
                            <div className="tps-reply-date">
                              <FaClock /> {reply.date}
                            </div>
                          </div>
                          <p>{reply.content}</p>
                          <div className="tps-reply-actions">
                            <button onClick={() => handleReplyClick(comment.id)} className="tps-reply-btn">
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
      </div>
    </div>
  );
};

export default Comments;
