const {
  createSegmentsFromItems,
  aggregateOrderStatus,
  ensureSegmentsForOrder,
  updateOrderStatusFromSegments,
  PROGRESS_STATUSES
} = require('../orderSegments');

describe('orderSegments utilities', () => {
  test('createSegmentsFromItems regroupe les articles par vendeur', () => {
    const sellerA = '60f7c04e1a2b3c4d5e6f7a11';
    const sellerB = '60f7c04e1a2b3c4d5e6f7a22';

    const items = [
      { seller: sellerA, unitPrice: 1000, quantity: 2 },
      { seller: sellerB, unitPrice: 1500, quantity: 1 },
      { seller: sellerA, unitPrice: 500, quantity: 3 }
    ];

    const segments = createSegmentsFromItems(items);
    expect(segments).toHaveLength(2);

    const segmentA = segments.find((segment) => segment.seller.toString() === sellerA);
    const segmentB = segments.find((segment) => segment.seller.toString() === sellerB);

    expect(segmentA.subtotal).toBe(1000 * 2 + 500 * 3);
    expect(segmentB.subtotal).toBe(1500 * 1);
    expect(segmentA.items).toHaveLength(2);
    expect(segmentB.items).toHaveLength(1);
  });

  test('aggregateOrderStatus retourne le statut le moins avancé', () => {
    const segments = [
      { status: 'preparing' },
      { status: 'ready-for-pickup' },
      { status: 'confirmed' }
    ];

    const status = aggregateOrderStatus(segments, 'pending');
    expect(status).toBe('confirmed');
  });

  test('ensureSegmentsForOrder crée des segments à partir des articles', () => {
    const orderMock = {
      status: 'pending',
      items: [
        { seller: '60f7c04e1a2b3c4d5e6f7a11', unitPrice: 1000, quantity: 1 },
        { seller: '60f7c04e1a2b3c4d5e6f7a22', unitPrice: 2000, quantity: 2 }
      ],
      markModified: jest.fn()
    };

    const created = ensureSegmentsForOrder(orderMock);
    expect(created).toBe(true);
    expect(orderMock.segments).toHaveLength(2);
    expect(orderMock.markModified).toHaveBeenCalledWith('segments');
  });

  test('updateOrderStatusFromSegments agrège le statut des segments', () => {
    const orderMock = {
      status: 'pending',
      segments: [
        { status: 'confirmed' },
        { status: 'preparing' }
      ]
    };

    const status = updateOrderStatusFromSegments(orderMock, 'pending');
    expect(PROGRESS_STATUSES.includes(status)).toBe(true);
    expect(status).toBe('confirmed');
  });
});

