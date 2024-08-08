from odoo import _, api, fields, models


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    margin_sale = fields.Float(string="Margin")
    minimum_sale_price = fields.Float(string="Minimum sale price", compute='_compute_minimum_sale_price', store=True)


    @api.depends('margin_sale', 'standard_price')
    def _compute_minimum_sale_price(self):
        for rec in self:
            rec.minimum_sale_price = rec.standard_price * (1 + rec.margin_sale/100)
            

