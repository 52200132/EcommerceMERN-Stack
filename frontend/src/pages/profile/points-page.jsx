import { Alert, Badge, Button, Spinner, Table } from "react-bootstrap";
import { BsArrowRepeat, BsTicketPerforated } from "react-icons/bs";

import {
  useGetPointsHistoryQuery,
  useGetPointsOverviewQuery,
} from "#services/user-services";
import { formatDateTime } from "#utils";
import { formatOrderCode, getPaymentStatusMeta } from "#utils/order-helpers";

const PointsPage = () => {
  const {
    data: overviewData,
    isFetching: isLoadingOverview,
    refetch: refetchOverview,
    error: overviewError,
  } = useGetPointsOverviewQuery();
  const {
    data: historyData,
    isFetching: isLoadingHistory,
    refetch: refetchHistory,
    error: historyError,
  } = useGetPointsHistoryQuery();

  const overview = overviewData?.dt || {};
  const history = historyData?.dt?.points_history || [];

  const handleRefresh = () => {
    refetchOverview();
    refetchHistory();
  };

  const overviewErrorMsg = overviewError?.data?.em || overviewError?.em;
  const historyErrorMsg = historyError?.data?.em || historyError?.em;

  const formatPoints = (value) => (value || 0).toLocaleString("vi-VN");

  return (
    <div className="profile-panel points-panel">
      <div className="profile-panel__heading">
        <div>
          <h2>Tích Điểm Thành Viên</h2>
          <p>Theo dõi điểm khả dụng, đã dùng và lịch sử tích lũy</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={handleRefresh}>
            <BsArrowRepeat className="me-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {overviewErrorMsg ? (
        <Alert variant="danger">{overviewErrorMsg}</Alert>
      ) : null}

      <div className="points-summary">
        <div className="points-summary__item primary">
          <div className="points-summary__icon">
            <BsTicketPerforated />
          </div>
          <div>
            <div className="points-summary__label">Điểm khả dụng</div>
            <div className="points-summary__value">
              {isLoadingOverview ? <Spinner size="sm" /> : formatPoints(overview.points_available)}
            </div>
          </div>
        </div>
        {/* <div className="points-summary__item">
          <div className="points-summary__label">Điểm đã dùng</div>
          <div className="points-summary__value text-danger">
            {isLoadingOverview ? <Spinner size="sm" /> : formatPoints(overview.points_used)}
          </div>
        </div>
        <div className="points-summary__item">
          <div className="points-summary__label">Điểm đã tích lũy</div>
          <div className="points-summary__value text-success">
            {isLoadingOverview ? <Spinner size="sm" /> : formatPoints(overview.loyalty_points_earned)}
          </div>
        </div>
        <div className="points-summary__item">
          <div className="points-summary__label">Điểm chờ xét</div>
          <div className="points-summary__value text-warning">
            {isLoadingOverview ? <Spinner size="sm" /> : formatPoints(overview.points_pending)}
          </div>
        </div> */}
      </div>

      {historyErrorMsg ? (
        <Alert variant="warning" className="mt-3">
          {historyErrorMsg}
        </Alert>
      ) : null}

      <div className="order-block points-block">
        <header className="order-block__header">
          <h5 className="mb-0">Lịch sử điểm thưởng</h5>
        </header>
        <div className="order-block__body">
          {isLoadingHistory ? (
            <div className="d-flex align-items-center gap-2 text-muted">
              <Spinner size="sm" animation="border" /> Đang tải lịch sử...
            </div>
          ) : history.length ? (
            <div className="table-responsive">
              <Table hover size="sm" className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Mã đơn</th>
                    <th className="text-end text-success">Điểm cộng</th>
                    <th className="text-end text-danger">Điểm trừ</th>
                    <th className="text-end">Thanh toán</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => {
                    const paymentMeta = getPaymentStatusMeta(entry.payment_status);
                    const pendingLoyaltyPoints = entry.payment_status === 'pending' ? entry.loyalty_points_earned : 0;
                    return (
                      <tr key={entry._id}>
                        <td>{formatDateTime(entry.createdAt)}</td>
                        <td className="fw-semibold">{formatOrderCode(entry._id)}</td>
                        <td className={`text-end fw-semibold ${pendingLoyaltyPoints ? 'text-warning' : 'text-success'}`}>
                          {pendingLoyaltyPoints && <Badge bg="warning" className="me-1">Chờ xét</Badge>}
                          {entry.loyalty_points_earned ? `+${formatPoints(entry.loyalty_points_earned)}` : ""}
                        </td>
                        <td className="text-end text-danger fw-semibold">
                          {entry.points_used ? `-${formatPoints(entry.points_used)}` : "0"}
                        </td>
                        <td className="text-end">
                          <Badge bg={paymentMeta.variant}>{paymentMeta.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-muted">Chưa có giao dịch điểm.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PointsPage;
