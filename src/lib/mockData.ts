import { Product, Category, Order, User } from '@/types';

// Mock product data
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Loose Fit Hoodie',
    description: 'Premium cotton hoodie with a relaxed fit. Perfect for casual wear and layering. Features a soft fleece interior and adjustable drawstring hood.',
    price: 129.99,
    originalPrice: 159.99,
    images: [
      '/images/hoodie-beige-1.jpg',
      '/images/hoodie-beige-2.jpg',
      '/images/hoodie-beige-3.jpg'
    ],
    category: "Men's",
    subcategory: 'Hoodies',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Beige', 'Black', 'Gray', 'Navy'],
    inStock: true,
    featured: true,
    tags: ['casual', 'comfort', 'cotton', 'winter'],
  },
  {
    id: '2',
    name: 'Patterned Scarf',
    description: 'Elegant wool blend scarf with classic pattern. Adds sophistication to any outfit. Soft and warm for winter styling.',
    price: 89.99,
    images: [
      '/images/scarf-pattern-1.jpg',
      '/images/scarf-pattern-2.jpg'
    ],
    category: 'Accessories',
    subcategory: 'Scarves',
    sizes: ['One Size'],
    colors: ['Gray', 'Black', 'Navy', 'Burgundy'],
    inStock: true,
    featured: true,
    tags: ['winter', 'accessories', 'wool', 'pattern'],
  },
  {
    id: '3',
    name: 'Relaxed Fit Coat Jacket',
    description: 'Premium winter coat with water-resistant finish. Features multiple pockets and adjustable cuffs. Perfect for cold weather.',
    price: 299.99,
    originalPrice: 349.99,
    images: [
      '/images/coat-black-1.jpg',
      '/images/coat-black-2.jpg',
      '/images/coat-black-3.jpg',
      '/images/coat-black-4.jpg'
    ],
    category: "Men's",
    subcategory: 'Outerwear',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Navy', 'Gray', 'Olive'],
    inStock: true,
    featured: true,
    tags: ['winter', 'outerwear', 'waterproof', 'premium'],
  },
  {
    id: '4',
    name: 'Rib-Knit Hat',
    description: 'Classic rib-knit beanie made from soft wool blend. One size fits most. Perfect for cold weather.',
    price: 45.99,
    images: [
      '/images/hat-beige-1.jpg',
      '/images/hat-beige-2.jpg'
    ],
    category: 'Accessories',
    subcategory: 'Hats',
    sizes: ['One Size'],
    colors: ['Beige', 'Black', 'Gray', 'Navy', 'Red'],
    inStock: true,
    featured: true,
    tags: ['winter', 'accessories', 'wool', 'knit'],
  },
  {
    id: '5',
    name: 'Slim Fit Jeans',
    description: 'Premium denim jeans with a modern slim fit. Made from stretch cotton for comfort and mobility.',
    price: 149.99,
    images: [
      '/images/jeans-blue-1.jpg',
      '/images/jeans-blue-2.jpg'
    ],
    category: "Men's",
    subcategory: 'Jeans',
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: ['Dark Blue', 'Light Blue', 'Black'],
    inStock: true,
    featured: false,
    tags: ['denim', 'casual', 'stretch', 'cotton'],
  },
  {
    id: '6',
    name: 'Cashmere Sweater',
    description: 'Luxurious 100% cashmere sweater with a classic crew neck. Incredibly soft and warm.',
    price: 299.99,
    images: [
      '/images/sweater-gray-1.jpg',
      '/images/sweater-gray-2.jpg'
    ],
    category: "Women's",
    subcategory: 'Sweaters',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Gray', 'Cream', 'Black', 'Navy'],
    inStock: true,
    featured: true,
    tags: ['luxury', 'cashmere', 'winter', 'premium'],
  },
  {
    id: '7',
    name: 'Leather Handbag',
    description: 'Handcrafted leather handbag with multiple compartments. Perfect for work or casual outings.',
    price: 199.99,
    originalPrice: 249.99,
    images: [
      '/images/handbag-brown-1.jpg',
      '/images/handbag-brown-2.jpg',
      '/images/handbag-brown-3.jpg'
    ],
    category: "Women's",
    subcategory: 'Bags',
    sizes: ['One Size'],
    colors: ['Brown', 'Black', 'Tan'],
    inStock: true,
    featured: false,
    tags: ['leather', 'accessories', 'work', 'handcrafted'],
  },
  {
    id: '8',
    name: 'Kids Rainbow T-Shirt',
    description: 'Fun and colorful t-shirt for kids. Made from organic cotton. Machine washable.',
    price: 29.99,
    images: [
      '/images/kids-tshirt-1.jpg',
      '/images/kids-tshirt-2.jpg'
    ],
    category: 'Kids',
    subcategory: 'T-Shirts',
    sizes: ['2T', '3T', '4T', '5T', '6', '8', '10', '12'],
    colors: ['Rainbow', 'Blue', 'Pink'],
    inStock: true,
    featured: false,
    tags: ['kids', 'organic', 'colorful', 'cotton'],
  },
];

// Mock categories
export const mockCategories: Category[] = [
  {
    id: '1',
    name: "Men's",
    slug: 'mens',
    image: '/images/category-mens.jpg',
    subcategories: [
      { id: '1-1', name: 'T-Shirts', slug: 'tshirts' },
      { id: '1-2', name: 'Hoodies', slug: 'hoodies' },
      { id: '1-3', name: 'Jeans', slug: 'jeans' },
      { id: '1-4', name: 'Outerwear', slug: 'outerwear' },
      { id: '1-5', name: 'Shoes', slug: 'shoes' },
    ]
  },
  {
    id: '2',
    name: "Women's",
    slug: 'womens',
    image: '/images/category-womens.jpg',
    subcategories: [
      { id: '2-1', name: 'Dresses', slug: 'dresses' },
      { id: '2-2', name: 'Sweaters', slug: 'sweaters' },
      { id: '2-3', name: 'Bags', slug: 'bags' },
      { id: '2-4', name: 'Shoes', slug: 'shoes' },
      { id: '2-5', name: 'Jewelry', slug: 'jewelry' },
    ]
  },
  {
    id: '3',
    name: 'Kids',
    slug: 'kids',
    image: '/images/category-kids.jpg',
    subcategories: [
      { id: '3-1', name: 'T-Shirts', slug: 'tshirts' },
      { id: '3-2', name: 'Pants', slug: 'pants' },
      { id: '3-3', name: 'Dresses', slug: 'dresses' },
      { id: '3-4', name: 'Shoes', slug: 'shoes' },
    ]
  },
  {
    id: '4',
    name: 'Accessories',
    slug: 'accessories',
    image: '/images/category-accessories.jpg',
    subcategories: [
      { id: '4-1', name: 'Hats', slug: 'hats' },
      { id: '4-2', name: 'Scarves', slug: 'scarves' },
      { id: '4-3', name: 'Belts', slug: 'belts' },
      { id: '4-4', name: 'Watches', slug: 'watches' },
    ]
  },
  {
    id: '5',
    name: 'Gifts',
    slug: 'gifts',
    image: '/images/category-gifts.jpg',
  }
];

// Mock orders
export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    userId: '1',
    items: [
      {
        id: 'item-1',
        productId: '1',
        product: mockProducts[0],
        quantity: 2,
        size: 'L',
        color: 'Beige'
      },
      {
        id: 'item-2',
        productId: '3',
        product: mockProducts[2],
        quantity: 1,
        size: 'M',
        color: 'Black'
      }
    ],
    total: 559.97,
    status: 'delivered',
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
      phone: '+1 (555) 123-4567'
    },
    billingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
      phone: '+1 (555) 123-4567'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-18T14:20:00Z'
  },
  {
    id: 'ORD-002',
    userId: '1',
    items: [
      {
        id: 'item-3',
        productId: '6',
        product: mockProducts[5],
        quantity: 1,
        size: 'M',
        color: 'Gray'
      }
    ],
    total: 299.99,
    status: 'processing',
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
      phone: '+1 (555) 123-4567'
    },
    billingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
      phone: '+1 (555) 123-4567'
    },
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-20T09:15:00Z'
  }
];

// Mock users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'customer',
    avatar: '/images/avatar-1.jpg'
  },
  {
    id: '2',
    email: 'admin@ajebotailor.com',
    name: 'Admin User',
    role: 'admin',
    avatar: '/images/avatar-admin.jpg'
  }
];
