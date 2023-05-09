# Final Project ChatGPT Summary

**By Caden Harris and Kollin Murphy**

## Introduction

We have decided to use ChatGPT for various tasks within our project. However, we have found that it is more helpful for conceptual understanding of problems than for implementing code. When asked to write code, it sometimes makes a lot of errors. In such cases, correcting its mistakes by giving it enough prompts can take longer than writing the code correctly ourselves.

## Dynamic Loading

I asked ChatGPT for help in implementing dynamic loading of assets and scripts in our project. Since we were using ES modules instead of global scripts as demonstrated in class, I wasn't sure how to make `requirejs` work. Although ChatGPT offered some solutions, none of them worked. Eventually, I resorted to trial and error, and figured it out myself. The final product uses `await import('<filename>')` to load modules dynamically, and we are able to directly import types from other files for strong typing. Because the direct type dependency is stripped out when compiled to JavaScript, we can still dynamically load everything as usual, and it is working well. Unfortunately ChatGPT was unable to point us in the right direction in this case.

## Attract Mode

We found the transcript of your conversation with ChatGPT to be quite helpful in implementing attract mode. It seemed that prompting it and asking for more detail on a specific option worked very well. As a result, we were able to implement a rule-based system for attract mode based on ChatGPT's explanation.

Although ChatGPT's explanation went above and beyond what we needed for attract mode, it still worked very well. We didn't have to analyze the trajectory of enemies or bullets, yet the ship is able to avoid collisions effectively. Without this help from ChatGPT, we may have overengineered a solution that would have been unnecessarily complex.

## Reflection on use in earlier classes

Reflecting on our experiences in classes like CS1410 and CS2420, we believe that if we had access to ChatGPT, we may not have been as well-prepared for the classes we are in now. In these early classes, assignments typically involve solving simple problems that are well-documented online. ChatGPT is often capable of producing functional code for these problems. However, in later classes, the problems become more complex and require a deeper understanding of the concepts.

ChatGPT may not be as effective at providing this understanding, and relying too heavily on it could be detrimental. It may lead to a false sense of understanding and a tendency to copy and paste code without fully comprehending what it does. This could be problematic when debugging, as it may be difficult to identify and fix errors. Therefore, we believe it is important to focus on understanding the underlying concepts behind the code, and use ChatGPT only as a supplement to aid in problem-solving.
