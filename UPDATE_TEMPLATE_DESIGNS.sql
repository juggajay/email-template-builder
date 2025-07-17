-- Update existing templates with proper JSON designs for Unlayer editor
-- This script adds the json_design field to templates that only have HTML content

-- Abandoned Cart templates
UPDATE email_templates 
SET json_design = '{
  "body": {
    "rows": [{
      "cells": [1],
      "columns": [{
        "contents": [{
          "type": "text",
          "values": {
            "containerPadding": "10px",
            "fontSize": "24px",
            "textAlign": "center",
            "lineHeight": "140%",
            "text": "<p style=\"line-height: 140%;\"><strong>You left something behind!</strong></p>"
          }
        }]
      }]
    }, {
      "cells": [1],
      "columns": [{
        "contents": [{
          "type": "image",
          "values": {
            "containerPadding": "10px",
            "src": {
              "url": "https://via.placeholder.com/600x400?text=Product+Image",
              "width": 600,
              "height": 400
            },
            "textAlign": "center",
            "altText": "Product Image"
          }
        }]
      }]
    }, {
      "cells": [1],
      "columns": [{
        "contents": [{
          "type": "text",
          "values": {
            "containerPadding": "10px",
            "fontSize": "16px",
            "textAlign": "center",
            "lineHeight": "140%",
            "text": "<p style=\"line-height: 140%;\">Complete your purchase and get <strong>10% OFF</strong> with code: <strong>COMEBACK10</strong></p>"
          }
        }]
      }]
    }, {
      "cells": [1],
      "columns": [{
        "contents": [{
          "type": "button",
          "values": {
            "containerPadding": "10px",
            "href": {
              "name": "web",
              "values": {
                "href": "",
                "target": "_blank"
              }
            },
            "buttonColors": {
              "color": "#FFFFFF",
              "backgroundColor": "#3AAEE0"
            },
            "size": {
              "autoWidth": true,
              "width": "100%"
            },
            "textAlign": "center",
            "padding": "10px 20px",
            "text": "<span style=\"font-size: 16px;\"><strong>Complete My Order</strong></span>"
          }
        }]
      }]
    }]
  }
}'::jsonb
WHERE category = 'abandoned-cart' AND json_design IS NULL;

-- Welcome templates
UPDATE email_templates 
SET json_design = '{
  "body": {
    "rows": [{
      "cells": [1],
      "columns": [{
        "contents": [{
          "type": "text",
          "values": {
            "containerPadding": "10px",
            "fontSize": "32px",
            "textAlign": "center",
            "lineHeight": "140%",
            "text": "<p style=\"line-height: 140%;\"><strong>Welcome to Our Store!</strong></p>"
          }
        }]
      }]
    }, {
      "cells": [1],
      "columns": [{
        "contents": [{
          "type": "text",
          "values": {
            "containerPadding": "10px",
            "fontSize": "16px",
            "textAlign": "center",
            "lineHeight": "140%",
            "text": "<p style=\"line-height: 140%;\">Thank you for joining our community. As a welcome gift, enjoy <strong>15% OFF</strong> your first purchase!</p>"
          }
        }]
      }]
    }, {
      "cells": [1],
      "columns": [{
        "contents": [{
          "type": "button",
          "values": {
            "containerPadding": "10px",
            "href": {
              "name": "web",
              "values": {
                "href": "",
                "target": "_blank"
              }
            },
            "buttonColors": {
              "color": "#FFFFFF",
              "backgroundColor": "#4CAF50"
            },
            "size": {
              "autoWidth": true,
              "width": "100%"
            },
            "textAlign": "center",
            "padding": "12px 24px",
            "text": "<strong>Shop Now</strong>"
          }
        }]
      }]
    }]
  }
}'::jsonb
WHERE category = 'welcome' AND json_design IS NULL;

-- Order Confirmation templates
UPDATE email_templates 
SET json_design = '{
  "body": {
    "rows": [{
      "cells": [1],
      "columns": [{
        "contents": [{
          "type": "text",
          "values": {
            "containerPadding": "10px",
            "fontSize": "28px",
            "textAlign": "center",
            "lineHeight": "140%",
            "text": "<p style=\"line-height: 140%;\"><strong>Order Confirmed!</strong></p>"
          }
        }]
      }]
    }, {
      "cells": [1],
      "columns": [{
        "contents": [{
          "type": "text",
          "values": {
            "containerPadding": "10px",
            "fontSize": "16px",
            "textAlign": "center",
            "lineHeight": "140%",
            "text": "<p style=\"line-height: 140%;\">Thank you for your order. We are preparing your items for shipment.</p>"
          }
        }]
      }]
    }, {
      "cells": [1],
      "columns": [{
        "contents": [{
          "type": "text",
          "values": {
            "containerPadding": "10px",
            "fontSize": "14px",
            "textAlign": "left",
            "lineHeight": "140%",
            "text": "<p><strong>Order Details:</strong></p><ul><li>Order #: 12345</li><li>Total: $99.99</li><li>Estimated Delivery: 3-5 business days</li></ul>"
          }
        }]
      }]
    }, {
      "cells": [1],
      "columns": [{
        "contents": [{
          "type": "button",
          "values": {
            "containerPadding": "10px",
            "href": {
              "name": "web",
              "values": {
                "href": "",
                "target": "_blank"
              }
            },
            "buttonColors": {
              "color": "#FFFFFF",
              "backgroundColor": "#FF9800"
            },
            "size": {
              "autoWidth": true,
              "width": "100%"
            },
            "textAlign": "center",
            "padding": "12px 24px",
            "text": "<strong>Track Order</strong>"
          }
        }]
      }]
    }]
  }
}'::jsonb
WHERE category = 'order-confirmation' AND json_design IS NULL;

-- Product Launch templates
UPDATE email_templates 
SET json_design = '{
  "body": {
    "rows": [{
      "cells": [1],
      "columns": [{
        "contents": [{
          "type": "text",
          "values": {
            "containerPadding": "10px",
            "fontSize": "36px",
            "textAlign": "center",
            "lineHeight": "140%",
            "text": "<p style=\"line-height: 140%;\"><strong>Introducing Our Latest Product!</strong></p>"
          }
        }]
      }]
    }, {
      "cells": [1],
      "columns": [{
        "contents": [{
          "type": "image",
          "values": {
            "containerPadding": "10px",
            "src": {
              "url": "https://via.placeholder.com/600x400?text=New+Product",
              "width": 600,
              "height": 400
            },
            "textAlign": "center",
            "altText": "New Product"
          }
        }]
      }]
    }, {
      "cells": [1],
      "columns": [{
        "contents": [{
          "type": "text",
          "values": {
            "containerPadding": "10px",
            "fontSize": "16px",
            "textAlign": "center",
            "lineHeight": "140%",
            "text": "<p style=\"line-height: 140%;\">Be the first to experience our revolutionary new product. Limited time offer: <strong>20% OFF</strong> for early adopters!</p>"
          }
        }]
      }]
    }, {
      "cells": [1],
      "columns": [{
        "contents": [{
          "type": "button",
          "values": {
            "containerPadding": "10px",
            "href": {
              "name": "web",
              "values": {
                "href": "",
                "target": "_blank"
              }
            },
            "buttonColors": {
              "color": "#FFFFFF",
              "backgroundColor": "#E91E63"
            },
            "size": {
              "autoWidth": true,
              "width": "100%"
            },
            "textAlign": "center",
            "padding": "14px 28px",
            "text": "<strong>Pre-Order Now</strong>"
          }
        }]
      }]
    }]
  }
}'::jsonb
WHERE category = 'product-launch' AND json_design IS NULL;

-- Promotional templates (including Black Friday, Flash Sale, etc.)
UPDATE email_templates 
SET json_design = '{
  "body": {
    "rows": [{
      "cells": [1],
      "columns": [{
        "contents": [{
          "type": "text",
          "values": {
            "containerPadding": "10px",
            "fontSize": "32px",
            "textAlign": "center",
            "lineHeight": "140%",
            "text": "<p style=\"line-height: 140%;\"><strong>Special Promotion!</strong></p>"
          }
        }]
      }]
    }, {
      "cells": [1],
      "columns": [{
        "contents": [{
          "type": "text",
          "values": {
            "containerPadding": "10px",
            "fontSize": "24px",
            "textAlign": "center",
            "lineHeight": "140%",
            "color": "#FF0000",
            "text": "<p style=\"line-height: 140%;\"><strong>UP TO 50% OFF</strong></p>"
          }
        }]
      }]
    }, {
      "cells": [1],
      "columns": [{
        "contents": [{
          "type": "image",
          "values": {
            "containerPadding": "10px",
            "src": {
              "url": "https://via.placeholder.com/600x300?text=Sale+Banner",
              "width": 600,
              "height": 300
            },
            "textAlign": "center",
            "altText": "Sale Banner"
          }
        }]
      }]
    }, {
      "cells": [1],
      "columns": [{
        "contents": [{
          "type": "button",
          "values": {
            "containerPadding": "10px",
            "href": {
              "name": "web",
              "values": {
                "href": "",
                "target": "_blank"
              }
            },
            "buttonColors": {
              "color": "#FFFFFF",
              "backgroundColor": "#FF0000"
            },
            "size": {
              "autoWidth": true,
              "width": "100%"
            },
            "textAlign": "center",
            "padding": "16px 32px",
            "text": "<strong>SHOP SALE NOW</strong>"
          }
        }]
      }]
    }]
  }
}'::jsonb
WHERE category = 'promotional' AND json_design IS NULL;

-- Display update results
SELECT 
    category, 
    COUNT(*) as templates_updated,
    COUNT(CASE WHEN json_design IS NOT NULL THEN 1 END) as has_design
FROM email_templates
GROUP BY category
ORDER BY category;