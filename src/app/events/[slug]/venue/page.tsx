/**
 * Top-level /venue route.
 *
 * Events with lodging put venue under About (`/about/venue`) or use the
 * combined `/venue-and-lodging` page. The Defense Industry Update (event 9)
 * has no lodging, so its nav carries Venue as a top-level item and needs a
 * route at that path. Same page, different URL - no second copy of the view.
 */
export { default } from '../about/venue/page';
