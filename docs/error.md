Uncaught SyntaxError: The requested module '/src/config/socials.ts?t=1780352254155' does not provide an export named 'default' (at HeroSection.tsx:7:8)
chunk-TKA7E7G6.js?v=73e4a046:14080 The above error occurred in one of your React components:

    at Lazy
    at RenderedRoute (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=73e4a046:4130:5)
    at Outlet (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=73e4a046:4536:26)
    at div
    at MotionDOMComponent (http://localhost:8080/node_modules/.vite/deps/framer-motion.js?v=73e4a046:8617:40)
    at PageTransition (http://localhost:8080/src/components/PageTransition.tsx:24:27)
    at PopChildMeasure (http://localhost:8080/node_modules/.vite/deps/framer-motion.js?v=73e4a046:7767:23)
    at PopChild (http://localhost:8080/node_modules/.vite/deps/framer-motion.js?v=73e4a046:7793:21)
    at PresenceChild (http://localhost:8080/node_modules/.vite/deps/framer-motion.js?v=73e4a046:7840:24)
    at AnimatePresence (http://localhost:8080/node_modules/.vite/deps/framer-motion.js?v=73e4a046:7917:26)
    at Layout (http://localhost:8080/src/components/Layout.tsx?t=1780341248531:28:19)
    at RenderedRoute (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=73e4a046:4130:5)
    at Routes (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=73e4a046:4600:5)
    at Suspense
    at Router (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=73e4a046:4543:15)
    at BrowserRouter (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=73e4a046:5289:5)
    at Provider (http://localhost:8080/node_modules/.vite/deps/chunk-EHX26FXM.js?v=73e4a046:37:15)
    at TooltipProvider (http://localhost:8080/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=73e4a046:2268:5)
    at QueryClientProvider (http://localhost:8080/node_modules/.vite/deps/@tanstack_react-query.js?v=73e4a046:2874:3)
    at App

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
logCapturedError @ chunk-TKA7E7G6.js?v=73e4a046:14080
update.callback @ chunk-TKA7E7G6.js?v=73e4a046:14100
callCallback @ chunk-TKA7E7G6.js?v=73e4a046:11296
commitUpdateQueue @ chunk-TKA7E7G6.js?v=73e4a046:11313
commitLayoutEffectOnFiber @ chunk-TKA7E7G6.js?v=73e4a046:17141
commitLayoutMountEffects_complete @ chunk-TKA7E7G6.js?v=73e4a046:18030
commitLayoutEffects_begin @ chunk-TKA7E7G6.js?v=73e4a046:18019
commitLayoutEffects @ chunk-TKA7E7G6.js?v=73e4a046:17970
commitRootImpl @ chunk-TKA7E7G6.js?v=73e4a046:19406
commitRoot @ chunk-TKA7E7G6.js?v=73e4a046:19330
finishConcurrentRender @ chunk-TKA7E7G6.js?v=73e4a046:18813
performConcurrentWorkOnRoot @ chunk-TKA7E7G6.js?v=73e4a046:18768
workLoop @ chunk-TKA7E7G6.js?v=73e4a046:197
flushWork @ chunk-TKA7E7G6.js?v=73e4a046:176
performWorkUntilDeadline @ chunk-TKA7E7G6.js?v=73e4a046:384
postMessage
schedulePerformWorkUntilDeadline @ chunk-TKA7E7G6.js?v=73e4a046:407
performWorkUntilDeadline @ chunk-TKA7E7G6.js?v=73e4a046:387
postMessage
schedulePerformWorkUntilDeadline @ chunk-TKA7E7G6.js?v=73e4a046:407
requestHostCallback @ chunk-TKA7E7G6.js?v=73e4a046:418
unstable_scheduleCallback @ chunk-TKA7E7G6.js?v=73e4a046:330
scheduleCallback$1 @ chunk-TKA7E7G6.js?v=73e4a046:19879
ensureRootIsScheduled @ chunk-TKA7E7G6.js?v=73e4a046:18702
retryTimedOutBoundary @ chunk-TKA7E7G6.js?v=73e4a046:19672
resolveRetryWakeable @ chunk-TKA7E7G6.js?v=73e4a046:19703
Promise.then
(anonymous) @ chunk-TKA7E7G6.js?v=73e4a046:17704
attachSuspenseRetryListeners @ chunk-TKA7E7G6.js?v=73e4a046:17691
commitMutationEffectsOnFiber @ chunk-TKA7E7G6.js?v=73e4a046:17889
recursivelyTraverseMutationEffects @ chunk-TKA7E7G6.js?v=73e4a046:17735
commitMutationEffectsOnFiber @ chunk-TKA7E7G6.js?v=73e4a046:17946
recursivelyTraverseMutationEffects @ chunk-TKA7E7G6.js?v=73e4a046:17735
commitMutationEffectsOnFiber @ chunk-TKA7E7G6.js?v=73e4a046:17946
recursivelyTraverseMutationEffects @ chunk-TKA7E7G6.js?v=73e4a046:17735
commitMutationEffectsOnFiber @ chunk-TKA7E7G6.js?v=73e4a046:17749
recursivelyTraverseMutationEffects @ chunk-TKA7E7G6.js?v=73e4a046:17735
commitMutationEffectsOnFiber @ chunk-TKA7E7G6.js?v=73e4a046:17749
recursivelyTraverseMutationEffects @ chunk-TKA7E7G6.js?v=73e4a046:17735
commitMutationEffectsOnFiber @ chunk-TKA7E7G6.js?v=73e4a046:17946
recursivelyTraverseMutationEffects @ chunk-TKA7E7G6.js?v=73e4a046:17735
commitMutationEffectsOnFiber @ chunk-TKA7E7G6.js?v=73e4a046:17749
recursivelyTraverseMutationEffects @ chunk-TKA7E7G6.js?v=73e4a046:17735
commitMutationEffectsOnFiber @ chunk-TKA7E7G6.js?v=73e4a046:17749
recursivelyTraverseMutationEffects @ chunk-TKA7E7G6.js?v=73e4a046:17735
commitMutationEffectsOnFiber @ chunk-TKA7E7G6.js?v=73e4a046:17946
recursivelyTraverseMutationEffects @ chunk-TKA7E7G6.js?v=73e4a046:17735
commitMutationEffectsOnFiber @ chunk-TKA7E7G6.js?v=73e4a046:17749
recursivelyTraverseMutationEffects @ chunk-TKA7E7G6.js?v=73e4a046:17735
commitMutationEffectsOnFiber @ chunk-TKA7E7G6.js?v=73e4a046:17749
recursivelyTraverseMutationEffects @ chunk-TKA7E7G6.js?v=73e4a046:17735
commitMutationEffectsOnFiber @ chunk-TKA7E7G6.js?v=73e4a046:17844
commitMutationEffects @ chunk-TKA7E7G6.js?v=73e4a046:17713
commitRootImpl @ chunk-TKA7E7G6.js?v=73e4a046:19400
commitRoot @ chunk-TKA7E7G6.js?v=73e4a046:19330
finishConcurrentRender @ chunk-TKA7E7G6.js?v=73e4a046:18836
performConcurrentWorkOnRoot @ chunk-TKA7E7G6.js?v=73e4a046:18768
workLoop @ chunk-TKA7E7G6.js?v=73e4a046:197
flushWork @ chunk-TKA7E7G6.js?v=73e4a046:176
performWorkUntilDeadline @ chunk-TKA7E7G6.js?v=73e4a046:384
postMessage
schedulePerformWorkUntilDeadline @ chunk-TKA7E7G6.js?v=73e4a046:407
requestHostCallback @ chunk-TKA7E7G6.js?v=73e4a046:418
unstable_scheduleCallback @ chunk-TKA7E7G6.js?v=73e4a046:330
scheduleCallback$1 @ chunk-TKA7E7G6.js?v=73e4a046:19879
ensureRootIsScheduled @ chunk-TKA7E7G6.js?v=73e4a046:18702
scheduleUpdateOnFiber @ chunk-TKA7E7G6.js?v=73e4a046:18612
updateContainer @ chunk-TKA7E7G6.js?v=73e4a046:20834
ReactDOMHydrationRoot.render.ReactDOMRoot.render @ chunk-TKA7E7G6.js?v=73e4a046:21174
(anonymous) @ main.tsx:5
chunk-TKA7E7G6.js?v=73e4a046:19466 Uncaught SyntaxError: The requested module '/src/config/socials.ts?t=1780352254155' does not provide an export named 'default' (at HeroSection.tsx:7:8)
