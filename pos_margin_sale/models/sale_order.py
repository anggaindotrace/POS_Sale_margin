from odoo import _, api, fields, models



class SaleOrder(models.Model):
    _inherit = 'sale.order'


    def action_confirm(self):
        skip_check_price = self._context.get('skip_check_price')
        check_product = self.check_product_price()
        if len(check_product) > 0 and not skip_check_price:
            product_str = ('\n').join(f" * {product}" for product in check_product)
            message = f"Price of this product is less than minimum sale price \n\n{product_str} \n\nDo you want to continue with the confirmation?"
            wizard = self.env['sale.confirmation.wizard'].create({'message': message})
            return {
                'type': 'ir.actions.act_window',
                'name': _('Confirm minimum sale price'),
                'view_mode': 'form',
                'res_model': 'sale.confirmation.wizard',
                'target': 'new',
                'res_id': wizard.id,
            }
        return super(SaleOrder, self).action_confirm()

            

    def check_product_price(self):
        products = []
        for line in self.order_line:
            if line.price_unit < line.minimum_sale_price:
                products.append(line.product_template_id.display_name)
        return products

class SaleOrderLine(models.Model):
    _inherit = 'sale.order.line'


    minimum_sale_price = fields.Float(string="Minimum sale price", related='product_template_id.minimum_sale_price')