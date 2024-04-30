import { User } from '../entities/users'
import { Event } from '../entities/events'
import { EventType } from '../entities/event-types'
import { Location } from '../entities/locations'
import { Vehicle } from '../entities/vehicles'
import { ExcelUpload } from '../entities/excel-upload'
import { Seller } from '../entities/sellers'
import { EmdUpdate } from "../entities/emd-updates";
import { Bid } from "../entities/bids";
import { State } from "../entities/states";
import {Coupen} from '../entities/coupenTemp'
import { Payment } from "../entities/payments";
import {ContactUs}from '../entities/contactUs'
import { WorkSheet } from '../entities/worksheet'
import {FindAuction}from '../entities/findAuction'
import {Institution} from '../entities/institution'
import {SellACar} from '../entities/sellACar'
import {DeletedBid} from '../entities/deletedBids'
 import {Notification} from '../entities/notification'

export { router } from "./restRoutes";
export { extendGraphqlSchema } from "./graphqlRoutes";
export const lists = {
  User,
  Payment,
  EmdUpdate,
  Event,
  Vehicle,
  Bid,
  EventType,
  Location,
  State,
   ExcelUpload,
  Seller,
  ContactUs,
 Coupen,
 WorkSheet,
FindAuction,
Institution,
SellACar,
DeletedBid,
 Notification
};