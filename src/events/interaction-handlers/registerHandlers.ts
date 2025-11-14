import { componentRegistry } from '@/interactions';
import {
  handleProfileShowPublic,
  handleEditBio,
  handleEditPhrase,
  handleChangeBackground,
} from './buttons/profileHandlers';
import {
  handleShopBackgrounds,
  handleShopFrames,
  handleChangeFrame,
  handleCarouselNavigation,
  handleFrameCarouselNavigation,
  handleBuyFrame,
  handleBuyBackground,
} from './buttons/shopHandlers';

/**
 * Register all button and select menu handlers
 * 
 * This function is called ONCE from the bot's ready event handler.
 * 
 * HOW TO MIGRATE HANDLERS:
 * 
 * 1. Extract handler logic from interactionCreate.ts
 * 2. Create file in src/events/interaction-handlers/buttons/ or selectMenus/
 * 3. Import the handler function here
 * 4. Register it using componentRegistry.registerButton() or registerSelectMenu()
 * 5. Test thoroughly
 * 6. Remove the legacy if-else block from interactionCreate.ts
 * 
 * EXAMPLE:
 * ```typescript
 * import { handleEditBio } from './buttons/profileHandlers';
 * componentRegistry.registerButton('edit_bio', handleEditBio);
 * ```
 * 
 * PATTERN-BASED HANDLERS:
 * ```typescript
 * componentRegistry.registerButtonPattern(/^carousel_/, handleCarousel);
 * componentRegistry.registerButtonPattern(/^buy_bg_/, handleBuyBackground);
 * ```
 */
export function registerAllHandlers(): void {
  // ✅ MIGRATED HANDLERS (tested and working)
  
  // Profile buttons
  componentRegistry.registerButton('profile_show_public', handleProfileShowPublic);
  componentRegistry.registerButton('edit_bio', handleEditBio);
  componentRegistry.registerButton('edit_phrase', handleEditPhrase);
  componentRegistry.registerButton('change_background', handleChangeBackground);

  // Shop entry buttons
  componentRegistry.registerButton('shop_backgrounds', handleShopBackgrounds);
  componentRegistry.registerButton('shop_frames', handleShopFrames);
  componentRegistry.registerButton('change_frame', handleChangeFrame);

  // Carousel navigation patterns
  componentRegistry.registerButtonPattern(/^carousel_(next|prev)_\d+$/, handleCarouselNavigation);
  componentRegistry.registerButtonPattern(/^frame_carousel_(next|prev)_\d+$/, handleFrameCarouselNavigation);

  // Purchase patterns
  componentRegistry.registerButtonPattern(/^buy_frame_.+_\d+$/, handleBuyFrame);
  componentRegistry.registerButtonPattern(/^buy_bg_.+_\d+$/, handleBuyBackground);
  
  // 🔜 TODO: Extract and register remaining handlers:
  // Guild handlers
  // componentRegistry.registerButton(/^guild_approve_/, handleGuildApprove);
  // componentRegistry.registerButton(/^guild_reject_/, handleGuildReject);
  
  // Shop/Carousel handlers
  // componentRegistry.registerButton('shop_backgrounds', handleShopBackgrounds);
  // componentRegistry.registerButton('shop_frames', handleShopFrames);
  // componentRegistry.registerButton(/^carousel_/, handleCarousel);
  // componentRegistry.registerButton(/^frame_carousel_/, handleFrameCarousel);
  
  // Select menus
  // componentRegistry.registerSelectMenu('help_category_select', handleHelpCategory);
  // componentRegistry.registerSelectMenu('select_background', handleSelectBackground);

  const buttonCount = componentRegistry.getRegisteredButtons().length;
  const menuCount = componentRegistry.getRegisteredSelectMenus().length;
  
  if (buttonCount > 0 || menuCount > 0) {
    console.log(
      `✅ Component handlers registered: ${buttonCount} buttons, ${menuCount} select menus`,
    );
  } else {
    console.log(
      '📝 ComponentRegistry ready (no handlers registered yet - migration in progress)',
    );
  }
}
